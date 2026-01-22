const mongoose = require('mongoose');

const sourcingItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  notes: String
}, { _id: true });

const sourcingSchema = new mongoose.Schema({
  sourcingNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  supplier: {
    name: {
      type: String,
      required: [true, 'Le nom du fournisseur est requis'],
      trim: true
    },
    contact: String,
    phone: String,
    email: String,
    address: String
  },
  
  items: [sourcingItemSchema],
  
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: [
      'draft',          // Brouillon
      'ordered',        // Commandé
      'partial',        // Partiellement reçu
      'received',       // Reçu
      'cancelled'       // Annulé
    ],
    default: 'draft'
  },
  
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: String
  }],
  
  orderDate: {
    type: Date,
    default: Date.now
  },
  
  expectedDeliveryDate: Date,
  
  actualDeliveryDate: Date,
  
  payment: {
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit', 'momo']
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  otherCosts: {
    type: Number,
    default: 0,
    min: 0
  },
  
  finalCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  notes: {
    type: String,
    maxlength: 2000
  },
  
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Pour suivre si la transaction de dépense a été créée
  transactionCreated: {
    type: Boolean,
    default: false
  },
  
  // Pour suivre si le stock a été enregistré
  stockRecorded: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index pour recherche et performance
//sourcingSchema.index({ sourcingNumber: 1 });
sourcingSchema.index({ status: 1, orderDate: -1 });
sourcingSchema.index({ 'supplier.name': 1 });
sourcingSchema.index({ orderDate: -1 });
sourcingSchema.index({ expectedDeliveryDate: 1 });

// Générer un numéro de sourcing unique
sourcingSchema.pre('validate', async function(next) {
  if (!this.sourcingNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await mongoose.model('Sourcing').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.sourcingNumber = `SRC${year}${month}-${sequence}`;
  }
  next();
});

// Calculer le coût final avant sauvegarde
sourcingSchema.pre('save', function(next) {
  this.finalCost = this.totalCost + this.shippingCost + this.otherCosts;
  this.payment.dueAmount = this.finalCost - this.payment.paidAmount;
  next();
});

// Méthode pour mettre à jour le statut
sourcingSchema.methods.updateStatus = async function(newStatus, notes, updatedBy) {
  this.statusHistory.push({
    status: this.status,
    notes,
    updatedBy,
    timestamp: new Date()
  });
  
  this.status = newStatus;
  
  // Si le sourcing est reçu et confirmé, créer la transaction et mettre à jour le stock
  if (newStatus === 'received' && !this.transactionCreated) {
    await this.createExpenseTransaction();
    await this.updateProductStock(updatedBy);
  }
  
  await this.save();
  return this;
};

// Méthode pour créer la transaction de dépense
sourcingSchema.methods.createExpenseTransaction = async function() {
  if (this.transactionCreated) {
    return;
  }
  
  const Transaction = mongoose.model('Transaction');
  
  await Transaction.create({
    type: 'expense',
    category: 'sourcing',
    amount: this.finalCost,
    description: `Sourcing ${this.sourcingNumber} - ${this.supplier.name}`,
    relatedDocument: {
      model: 'Sourcing',
      id: this._id
    },
    paymentMethod: this.payment.method,
    date: this.actualDeliveryDate || new Date(),
    performedBy: this.createdBy
  });
  
  this.transactionCreated = true;
  await this.save();
};

// Méthode pour mettre à jour le stock des produits
sourcingSchema.methods.updateProductStock = async function(performedBy) {
  if (this.stockRecorded) {
    return;
  }
  
  const StockMovement = mongoose.model('StockMovement');
  
  for (const item of this.items) {
    const quantity = item.receivedQuantity > 0 ? item.receivedQuantity : item.quantity;
    
    await StockMovement.createRestockMovement(
      item.product,
      quantity,
      this._id,
      item.unitCost,
      performedBy || this.createdBy,
      `Ravitaillement depuis sourcing ${this.sourcingNumber}`
    );
  }
  
  this.stockRecorded = true;
  await this.save();
};

// Méthode pour marquer un article comme reçu
sourcingSchema.methods.receiveItem = async function(itemId, receivedQuantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Article non trouvé');
  }
  
  item.receivedQuantity = receivedQuantity;
  
  // Vérifier si tous les articles sont reçus
  const allReceived = this.items.every(i => i.receivedQuantity >= i.quantity);
  const someReceived = this.items.some(i => i.receivedQuantity > 0);
  
  if (allReceived) {
    this.status = 'received';
    this.actualDeliveryDate = new Date();
  } else if (someReceived && this.status !== 'received') {
    this.status = 'partial';
  }
  
  await this.save();
  return this;
};

// Méthode statique pour obtenir les statistiques
sourcingSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.orderDate = {};
    if (startDate) matchStage.orderDate.$gte = new Date(startDate);
    if (endDate) matchStage.orderDate.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$finalCost' },
        averageCost: { $avg: '$finalCost' }
      }
    }
  ]);
};

module.exports = mongoose.model('Sourcing', sourcingSchema);