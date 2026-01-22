const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail_url: String,
    is_primary: {
      type: Boolean,
      default: false
    }
  }],
  
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['bouquets', 'chocolats', 'peluches', 'bijoux', 'parfums', 'coffrets', 'autres']
  },
  
  stock: {
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Le stock ne peut pas être négatif']
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0
    },
    threshold: {
      type: Number,
      default: 10,
      min: 0
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock'
    }
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances de recherche
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'stock.status': 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual pour calculer le stock disponible
productSchema.virtual('availableStock').get(function() {
  return this.stock.quantity - this.stock.reserved;
});

// Middleware pour mettre à jour le statut du stock avant sauvegarde
productSchema.pre('save', function(next) {
  this.stock.available = this.stock.quantity - this.stock.reserved;
  
  if (this.stock.available <= 0) {
    this.stock.status = 'out_of_stock';
  } else if (this.stock.available <= this.stock.threshold) {
    this.stock.status = 'low_stock';
  } else {
    this.stock.status = 'in_stock';
  }
  
  next();
});

// Méthode pour vérifier la disponibilité
productSchema.methods.isAvailable = function(quantity = 1) {
  return this.isActive && this.stock.available >= quantity;
};

// Méthode pour réserver du stock
productSchema.methods.reserveStock = async function(quantity) {
  if (this.stock.available < quantity) {
    throw new Error('Stock insuffisant pour réserver');
  }
  
  this.stock.reserved += quantity;
  await this.save();
  return this;
};

// Méthode pour libérer du stock réservé
productSchema.methods.releaseStock = async function(quantity) {
  this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
  await this.save();
  return this;
};

// Méthode pour confirmer une vente (retirer du stock)
productSchema.methods.confirmSale = async function(quantity) {
  if (this.stock.reserved < quantity) {
    throw new Error('Stock réservé insuffisant');
  }
  
  this.stock.quantity -= quantity;
  this.stock.reserved -= quantity;
  this.metadata.purchases += quantity;
  await this.save();
  return this;
};

module.exports = mongoose.model('Product', productSchema);