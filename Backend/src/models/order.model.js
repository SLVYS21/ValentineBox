const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  image: {
    url: String,
    public_id: String
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  items: [orderItemSchema],
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: [
      'pending',           // En attente de confirmation
      'confirmed',         // Confirmée
      'processing',        // En traitement
      'ready',            // Prête pour livraison
      'out_for_delivery', // En livraison
      'delivered',        // Livrée
      'cancelled',        // Annulée
      'refunded'          // Remboursée
    ],
    default: 'pending'
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
  
  customer: {
    name: {
      type: String,
      required: [true, 'Le nom du client est requis'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      street: String,
      city: String,
      district: String,
      landmark: String
    }
  },
  
  delivery: {
    type: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'delivery'
    },
    date: Date,
    timeSlot: String,
    address: String,
    instructions: String,
    fee: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  payment: {
    method: {
      type: String,
      enum: ['cash', 'momo', 'bank_transfer', 'card'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  
  notes: {
    type: String,
    maxlength: 1000
  },
  
  internalNotes: {
    type: String,
    maxlength: 1000
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Pour suivre si le stock a été réservé
  stockReserved: {
    type: Boolean,
    default: false
  },
  
  // Pour suivre si la transaction a été créée
  transactionCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour recherche et performance
//orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'delivery.date': 1 });

// Générer un numéro de commande unique
orderSchema.pre('validate', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `SV${year}${month}${day}-${sequence}`;
  }
  next();
});

// Calculer le montant final avant sauvegarde
orderSchema.pre('save', function(next) {
  this.finalAmount = this.totalAmount + this.delivery.fee - this.discount;
  next();
});

// Méthode pour mettre à jour le statut
orderSchema.methods.updateStatus = async function(newStatus, notes, updatedBy) {
  this.statusHistory.push({
    status: this.status,
    notes,
    updatedBy,
    timestamp: new Date()
  });
  
  this.status = newStatus;
  
  // Si la commande est annulée, libérer le stock
  if (newStatus === 'cancelled' && this.stockReserved) {
    const Product = mongoose.model('Product');
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.releaseStock(item.quantity);
      }
    }
    this.stockReserved = false;
  }
  
  // Si la commande est confirmée, confirmer la vente
  if (newStatus === 'delivered' && this.stockReserved && this.payment.status === 'paid') {
    const Product = mongoose.model('Product');
    const StockMovement = mongoose.model('StockMovement');
    
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.confirmSale(item.quantity);
        
        // Créer un mouvement de stock
        await StockMovement.create({
          product: item.product,
          type: 'sale',
          quantity: -item.quantity,
          order: this._id,
          previousQuantity: product.stock.quantity + item.quantity,
          newQuantity: product.stock.quantity,
          performedBy: updatedBy || 'system'
        });
      }
    }
  }
  
  await this.save();
  return this;
};

// Méthode pour réserver le stock
orderSchema.methods.reserveStock = async function() {
  if (this.stockReserved) {
    return this;
  }
  
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Produit ${item.name} introuvable`);
    }
    
    if (!product.isAvailable(item.quantity)) {
      throw new Error(`Stock insuffisant pour ${item.name}`);
    }
    
    await product.reserveStock(item.quantity);
  }
  
  this.stockReserved = true;
  await this.save();
  return this;
};

// Méthode pour calculer les statistiques
orderSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$finalAmount' },
        averageOrderValue: { $avg: '$finalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);