const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Le produit est requis']
  },
  
  type: {
    type: String,
    enum: ['restock', 'sale', 'return', 'adjustment', 'reservation', 'release'],
    required: [true, 'Le type de mouvement est requis']
  },
  
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: 'La quantité ne peut pas être zéro'
    }
  },
  
  // Référence au sourcing si c'est un ravitaillement
  sourcing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sourcing'
  },
  
  // Référence à la commande si c'est une vente
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  previousQuantity: {
    type: Number,
    required: true
  },
  
  newQuantity: {
    type: Number,
    required: true
  },
  
  unitCost: {
    type: Number,
    min: 0,
    comment: 'Coût unitaire lors du ravitaillement'
  },
  
  totalCost: {
    type: Number,
    min: 0,
    comment: 'Coût total du mouvement (quantité * coût unitaire)'
  },
  
  reason: {
    type: String,
    maxlength: 500
  },
  
  notes: {
    type: String,
    maxlength: 1000
  },
  
  performedBy: {
    type: String,
    required: [true, 'L\'auteur du mouvement est requis']
  },
  
  metadata: {
    supplier: String,
    batchNumber: String,
    expiryDate: Date
  }
}, {
  timestamps: true
});

// Index pour rechercher l'historique
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });
stockMovementSchema.index({ sourcing: 1 });
stockMovementSchema.index({ order: 1 });

// Méthode statique pour créer un mouvement de ravitaillement
stockMovementSchema.statics.createRestockMovement = async function(productId, quantity, sourcingId, unitCost, performedBy, notes) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Produit introuvable');
  }
  
  const previousQuantity = product.stock.quantity;
  const newQuantity = previousQuantity + quantity;
  
  const movement = await this.create({
    product: productId,
    type: 'restock',
    quantity: quantity,
    sourcing: sourcingId,
    previousQuantity,
    newQuantity,
    unitCost,
    totalCost: unitCost * quantity,
    performedBy,
    notes
  });
  
  // Mettre à jour le stock du produit
  product.stock.quantity = newQuantity;
  await product.save();
  
  return movement;
};

// Méthode statique pour obtenir l'historique d'un produit
stockMovementSchema.statics.getProductHistory = async function(productId, limit = 50) {
  return this.find({ product: productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sourcing', 'supplier totalCost')
    .populate('order', 'orderNumber status');
};

// Méthode statique pour obtenir les statistiques de stock
stockMovementSchema.statics.getStockStatistics = async function(productId, startDate, endDate) {
  const matchStage = {
    product: mongoose.Types.ObjectId(productId)
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$totalCost' },
        count: { $sum: 1 },
        averageCost: { $avg: '$unitCost' }
      }
    }
  ]);
};

module.exports = mongoose.model('StockMovement', stockMovementSchema);