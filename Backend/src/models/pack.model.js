const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du pack est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'La description courte ne peut pas dépasser 200 caractères']
  },
  
  // Produits inclus dans le pack
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1']
    },
    // Prix unitaire au moment de la création du pack (pour référence)
    priceAtCreation: {
      type: Number,
      required: true
    }
  }],
  
  // Pricing
  originalPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix original ne peut pas être négatif']
  },
  
  packPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix du pack ne peut pas être négatif']
  },
  
  discount: {
    type: Number,
    default: 0
  },
  
  discountPercentage: {
    type: Number,
    default: 0
  },
  
  // Ciblage par budget
  budgetRange: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Le budget minimum ne peut pas être négatif']
    },
    max: {
      type: Number,
      required: true
    }
  },
  
  // Catégorisation
  category: {
    type: String,
    enum: [
      'petit_budget',      // < 15,000 FCFA
      'budget_moyen',      // 15,000 - 30,000 FCFA
      'budget_confortable', // 30,000 - 50,000 FCFA
      'budget_premium',    // 50,000 - 100,000 FCFA
      'budget_luxe'        // > 100,000 FCFA
    ],
    required: true
  },
  
  occasion: {
    type: String,
    enum: [
      'saint_valentin',
      'anniversaire',
      'declaration',
      'reconciliation',
      'cadeau_surprise',
      'toutes_occasions'
    ],
    default: 'saint_valentin'
  },
  
  theme: {
    type: String,
    enum: [
      'romantique',
      'gourmand',
      'luxe',
      'classique',
      'moderne',
      'personnalise'
    ]
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Image du pack
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  
  // Galerie d'images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Disponibilité
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Stock (basé sur le stock des produits composants)
  stockStatus: {
    type: String,
    enum: ['available', 'limited', 'out_of_stock'],
    default: 'available'
  },
  
  availableQuantity: {
    type: Number,
    default: 0
  },
  
  // Périodes de validité
  validFrom: {
    type: Date,
    default: Date.now
  },
  
  validUntil: {
    type: Date
  },
  
  // Statistiques
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  // Options supplémentaires
  customization: {
    allowPersonalization: {
      type: Boolean,
      default: false
    },
    personalizationFee: {
      type: Number,
      default: 0
    },
    personalizationOptions: [{
      type: String
    }]
  },
  
  delivery: {
    requiresSpecialHandling: {
      type: Boolean,
      default: false
    },
    specialHandlingFee: {
      type: Number,
      default: 0
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 1
    }
  },
  
  // Marketing
  highlights: [{
    type: String,
    maxlength: [100, 'Chaque highlight ne peut pas dépasser 100 caractères']
  }],
  
  badge: {
    type: String,
    enum: ['bestseller', 'new', 'limited', 'exclusive', 'promo']
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
//packSchema.index({ slug: 1 });
packSchema.index({ category: 1, isActive: 1 });
packSchema.index({ 'budgetRange.min': 1, 'budgetRange.max': 1 });
packSchema.index({ isActive: 1, isFeatured: -1 });
packSchema.index({ occasion: 1, theme: 1 });
packSchema.index({ validFrom: 1, validUntil: 1 });

// Index texte pour recherche
packSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Générer le slug avant sauvegarde
packSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Calculer la réduction avant sauvegarde
packSchema.pre('save', function(next) {
  if (this.isModified('originalPrice') || this.isModified('packPrice')) {
    this.discount = this.originalPrice - this.packPrice;
    this.discountPercentage = Math.round((this.discount / this.originalPrice) * 100);
  }
  next();
});

// Méthode pour vérifier la disponibilité du pack
packSchema.methods.checkAvailability = async function() {
  if (!this.isActive) {
    return {
      available: false,
      reason: 'Pack non actif'
    };
  }
  
  // Vérifier la période de validité
  const now = new Date();
  if (this.validFrom && this.validFrom > now) {
    return {
      available: false,
      reason: 'Pack pas encore disponible'
    };
  }
  
  if (this.validUntil && this.validUntil < now) {
    return {
      available: false,
      reason: 'Pack expiré'
    };
  }
  
  // Vérifier le stock de chaque produit
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      return {
        available: false,
        reason: `Produit ${product?.name || 'inconnu'} non disponible`,
        missingProduct: product?.name
      };
    }
    
    if (product.stock.available < item.quantity) {
      return {
        available: false,
        reason: `Stock insuffisant pour ${product.name}`,
        missingProduct: product.name,
        availableStock: product.stock.available,
        requiredStock: item.quantity
      };
    }
  }
  
  return {
    available: true,
    reason: 'Pack disponible'
  };
};

// Méthode pour calculer la quantité disponible du pack
packSchema.methods.calculateAvailableQuantity = async function() {
  const Product = mongoose.model('Product');
  let minAvailable = Infinity;
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      this.availableQuantity = 0;
      this.stockStatus = 'out_of_stock';
      return 0;
    }
    
    const possiblePacks = Math.floor(product.stock.available / item.quantity);
    minAvailable = Math.min(minAvailable, possiblePacks);
  }
  
  this.availableQuantity = minAvailable;
  
  // Mettre à jour le statut
  if (minAvailable === 0) {
    this.stockStatus = 'out_of_stock';
  } else if (minAvailable <= 5) {
    this.stockStatus = 'limited';
  } else {
    this.stockStatus = 'available';
  }
  
  return minAvailable;
};

// Méthode pour obtenir le prix actuel total des produits
packSchema.methods.getCurrentProductsPrice = async function() {
  const Product = mongoose.model('Product');
  let total = 0;
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  
  return total;
};

// Méthode pour réserver le stock des produits du pack
packSchema.methods.reserveStock = async function(quantity = 1) {
  const Product = mongoose.model('Product');
  const reserved = [];
  
  try {
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Produit ${item.product} introuvable`);
      }
      
      const totalNeeded = item.quantity * quantity;
      await product.reserveStock(totalNeeded);
      reserved.push({ productId: product._id, quantity: totalNeeded });
    }
    
    return { success: true, reserved };
  } catch (error) {
    // Rollback en cas d'erreur
    for (const res of reserved) {
      const product = await Product.findById(res.productId);
      if (product) {
        await product.releaseStock(res.quantity);
      }
    }
    throw error;
  }
};

// Méthode pour libérer le stock
packSchema.methods.releaseStock = async function(quantity = 1) {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const totalToRelease = item.quantity * quantity;
      await product.releaseStock(totalToRelease);
    }
  }
};

// Méthode pour confirmer la vente
packSchema.methods.confirmSale = async function(quantity = 1) {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const totalSold = item.quantity * quantity;
      await product.confirmSale(totalSold);
    }
  }
  
  // Mettre à jour les statistiques du pack
  this.metadata.purchases += quantity;
  this.metadata.revenue += this.packPrice * quantity;
  await this.save();
};

// Méthode statique pour trouver les packs par budget
packSchema.statics.findByBudget = async function(budget, options = {}) {
  const query = {
    isActive: true,
    'budgetRange.min': { $lte: budget },
    'budgetRange.max': { $gte: budget }
  };
  
  if (options.occasion) {
    query.occasion = { $in: [options.occasion, 'toutes_occasions'] };
  }
  
  if (options.theme) {
    query.theme = options.theme;
  }
  
  const packs = await this.find(query)
    .populate('items.product', 'name price images stock')
    .sort({ isFeatured: -1, 'metadata.purchases': -1 })
    .limit(options.limit || 10);
  
  // Vérifier la disponibilité de chaque pack
  const availablePacks = [];
  for (const pack of packs) {
    const availability = await pack.checkAvailability();
    if (availability.available) {
      availablePacks.push(pack);
    }
  }
  
  return availablePacks;
};

// Méthode statique pour obtenir les packs par catégorie
packSchema.statics.getByCategory = async function(category) {
  return this.find({ category, isActive: true })
    .populate('items.product', 'name price images stock')
    .sort({ isFeatured: -1, 'metadata.purchases': -1 });
};

// Virtual pour obtenir l'économie réalisée
packSchema.virtual('savings').get(function() {
  return {
    amount: this.discount,
    percentage: this.discountPercentage
  };
});

// Inclure les virtuals dans JSON
packSchema.set('toJSON', { virtuals: true });
packSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pack', packSchema);