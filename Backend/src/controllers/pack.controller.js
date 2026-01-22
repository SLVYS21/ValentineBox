const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Pack = require('../models/pack.model');
const Product = require('../models/product.model');

// @desc    Obtenir tous les packs
// @route   GET /api/v1/packs
// @access  Public
exports.getPacks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    occasion,
    theme,
    isActive,
    isFeatured,
    minBudget,
    maxBudget,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  // Filtres
  if (category) query.category = category;
  if (occasion) query.occasion = occasion;
  if (theme) query.theme = theme;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

  // Filtre par budget
  if (minBudget || maxBudget) {
    query['budgetRange.min'] = {};
    query['budgetRange.max'] = {};
    
    if (minBudget) {
      query['budgetRange.min'].$gte = parseFloat(minBudget);
    }
    if (maxBudget) {
      query['budgetRange.max'].$lte = parseFloat(maxBudget);
    }
  }

  // Vérifier la validité
  const now = new Date();
  query.$or = [
    { validFrom: { $lte: now } },
    { validFrom: { $exists: false } }
  ];
  query.$and = [
    {
      $or: [
        { validUntil: { $gte: now } },
        { validUntil: { $exists: false } }
      ]
    }
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [packs, total] = await Promise.all([
    Pack.find(query)
      .populate('items.product', 'name price images stock')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Pack.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: packs.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: packs
  });
});

// @desc    Obtenir un pack par ID ou slug
// @route   GET /api/v1/packs/:id
// @access  Public
exports.getPack = asyncHandler(async (req, res) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const pack = await Pack.findOne(query)
    .populate('items.product', 'name price description images stock category tags');

  if (!pack) {
    res.status(404);
    throw new Error('Pack introuvable');
  }

  // Incrémenter les vues
  pack.metadata.views += 1;
  await pack.save();

  // Vérifier la disponibilité
  const availability = await pack.checkAvailability();
  await pack.calculateAvailableQuantity();

  res.status(200).json({
    success: true,
    data: {
      ...pack.toObject(),
      availability
    }
  });
});

// @desc    Créer un pack
// @route   POST /api/v1/packs
// @access  Private/Admin
exports.createPack = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    items,
    packPrice,
    budgetRange,
    category,
    occasion,
    theme,
    tags,
    highlights,
    validFrom,
    validUntil,
    customization,
    delivery
  } = req.body;

  // Valider que tous les produits existent
  let originalPrice = 0;
  const packItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      res.status(404);
      throw new Error(`Produit ${item.product} introuvable`);
    }

    packItems.push({
      product: product._id,
      quantity: item.quantity,
      priceAtCreation: product.price
    });

    originalPrice += product.price * item.quantity;
  }

  // Créer le pack
  const pack = await Pack.create({
    name,
    description,
    shortDescription,
    items: packItems,
    originalPrice,
    packPrice,
    budgetRange,
    category,
    occasion,
    theme,
    tags,
    highlights,
    validFrom,
    validUntil,
    customization,
    delivery,
    createdBy: req.user._id
  });

  // Calculer la quantité disponible
  await pack.calculateAvailableQuantity();
  await pack.save();

  res.status(201).json({
    success: true,
    data: pack
  });
});

// @desc    Mettre à jour un pack
// @route   PUT /api/v1/packs/:id
// @access  Private/Admin
exports.updatePack = asyncHandler(async (req, res) => {
  let pack = await Pack.findById(req.params.id);

  if (!pack) {
    res.status(404);
    throw new Error('Pack introuvable');
  }

  // Si les items changent, recalculer le prix original
  if (req.body.items) {
    let originalPrice = 0;
    const packItems = [];

    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        res.status(404);
        throw new Error(`Produit ${item.product} introuvable`);
      }

      packItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtCreation: product.price
      });

      originalPrice += product.price * item.quantity;
    }

    req.body.items = packItems;
    req.body.originalPrice = originalPrice;
  }

  pack = await Pack.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Recalculer la disponibilité
  await pack.calculateAvailableQuantity();
  await pack.save();

  res.status(200).json({
    success: true,
    data: pack
  });
});

// @desc    Supprimer un pack
// @route   DELETE /api/v1/packs/:id
// @access  Private/Admin
exports.deletePack = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id);

  if (!pack) {
    res.status(404);
    throw new Error('Pack introuvable');
  }

  await pack.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Rechercher des packs par budget
// @route   GET /api/v1/packs/search/by-budget
// @access  Public
exports.searchPacksByBudget = asyncHandler(async (req, res) => {
  const { budget, occasion, theme } = req.query;

  if (!budget) {
    res.status(400);
    throw new Error('Le budget est requis');
  }

  const budgetAmount = parseFloat(budget);

  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    res.status(400);
    throw new Error('Budget invalide');
  }

  // Packs PARFAITS pour le budget (dans la fourchette)
  const perfectMatches = await Pack.findByBudget(budgetAmount, {
    occasion,
    theme,
    limit: 5
  });

  // Packs légèrement en-dessous (jusqu'à -20%)
  const belowBudgetQuery = {
    isActive: true,
    packPrice: {
      $gte: budgetAmount * 0.80,
      $lt: budgetAmount
    }
  };

  if (occasion) {
    belowBudgetQuery.occasion = { $in: [occasion, 'toutes_occasions'] };
  }

  const belowBudget = await Pack.find(belowBudgetQuery)
    .populate('items.product', 'name price images stock')
    .sort({ packPrice: -1 })
    .limit(3);

  // Packs légèrement au-dessus (jusqu'à +30%)
  const aboveBudgetQuery = {
    isActive: true,
    packPrice: {
      $gt: budgetAmount,
      $lte: budgetAmount * 1.30
    }
  };

  if (occasion) {
    aboveBudgetQuery.occasion = { $in: [occasion, 'toutes_occasions'] };
  }

  const aboveBudget = await Pack.find(aboveBudgetQuery)
    .populate('items.product', 'name price images stock')
    .sort({ packPrice: 1 })
    .limit(3);

  // Ajouter des informations de suggestion à chaque pack
  const enhancePacks = (packs, budget, type) => {
    return packs.map(pack => {
      const difference = pack.packPrice - budget;
      const percentage = ((difference / budget) * 100).toFixed(1);

      let suggestion;
      let tag;

      if (difference <= 0) {
        const savings = Math.abs(difference);
        tag = 'économie';
        suggestion = savings > 0
          ? `Économisez ${Math.round(savings)} FCFA avec ce pack complet !`
          : 'Pack parfait pour votre budget !';
      } else if (difference <= budget * 0.15) {
        tag = 'recommandé';
        suggestion = `Seulement ${Math.round(difference)} FCFA de plus pour ce pack premium !`;
      } else {
        tag = 'premium';
        suggestion = `Un pack exceptionnel à +${Math.round(difference)} FCFA. Ça vaut l'investissement !`;
      }

      return {
        ...pack.toObject(),
        budgetInfo: {
          tag,
          suggestion,
          difference: Math.round(difference),
          percentage: parseFloat(percentage),
          savings: pack.discount,
          savingsPercentage: pack.discountPercentage
        }
      };
    });
  };

  const enhancedPerfect = enhancePacks(perfectMatches, budgetAmount, 'perfect');
  const enhancedBelow = enhancePacks(belowBudget, budgetAmount, 'below');
  const enhancedAbove = enhancePacks(aboveBudget, budgetAmount, 'above');

  // Recommandation de catégorie
  let categoryRecommendation;
  if (budgetAmount < 15000) {
    categoryRecommendation = 'petit_budget';
  } else if (budgetAmount < 30000) {
    categoryRecommendation = 'budget_moyen';
  } else if (budgetAmount < 50000) {
    categoryRecommendation = 'budget_confortable';
  } else if (budgetAmount < 100000) {
    categoryRecommendation = 'budget_premium';
  } else {
    categoryRecommendation = 'budget_luxe';
  }

  // Obtenir tous les packs de la catégorie recommandée
  const categoryPacks = await Pack.getByCategory(categoryRecommendation);
  const enhancedCategory = enhancePacks(
    categoryPacks.filter(p => !perfectMatches.find(pm => pm._id.equals(p._id))),
    budgetAmount,
    'category'
  ).slice(0, 3);

  res.status(200).json({
    success: true,
    budget: budgetAmount,
    categoryRecommendation,
    summary: {
      totalPacks: enhancedPerfect.length + enhancedBelow.length + enhancedAbove.length,
      perfectMatches: enhancedPerfect.length,
      belowBudget: enhancedBelow.length,
      aboveBudget: enhancedAbove.length
    },
    recommendations: {
      perfect: {
        title: `Packs parfaits pour ${budgetAmount.toLocaleString()} FCFA 🎯`,
        description: 'Ces packs sont conçus spécialement pour votre budget',
        packs: enhancedPerfect
      },
      below: {
        title: 'Économisez tout en impressionnant ! 💰',
        description: 'Gardez un peu d\'argent de côté',
        packs: enhancedBelow
      },
      above: {
        title: 'Un peu plus pour beaucoup plus ! ✨',
        description: 'Quelques francs de plus pour un effet maximal',
        packs: enhancedAbove,
        upsellMessage: enhancedAbove.length > 0
          ? `Pour seulement ${Math.round(enhancedAbove[0].packPrice - budgetAmount)} FCFA de plus, offrez un pack inoubliable !`
          : null
      },
      category: {
        title: `Autres packs ${categoryRecommendation.replace('_', ' ')} 🎁`,
        description: 'D\'autres excellentes options dans votre gamme',
        packs: enhancedCategory
      }
    },
    advice: generatePackAdvice(budgetAmount, enhancedPerfect.length, categoryRecommendation)
  });
});

// Helper pour générer des conseils personnalisés
function generatePackAdvice(budget, perfectCount, category) {
  const advice = [];

  if (perfectCount === 0) {
    advice.push({
      type: 'info',
      message: 'Aucun pack exact pour ce budget.',
      action: 'Consultez nos suggestions ci-dessus ou créez votre propre panier.'
    });
  } else {
    advice.push({
      type: 'success',
      message: `${perfectCount} pack${perfectCount > 1 ? 's' : ''} parfait${perfectCount > 1 ? 's' : ''} pour votre budget !`,
      action: 'Des combinaisons soigneusement sélectionnées pour vous.'
    });
  }

  const categoryNames = {
    'petit_budget': 'Petit budget',
    'budget_moyen': 'Budget moyen',
    'budget_confortable': 'Budget confortable',
    'budget_premium': 'Budget premium',
    'budget_luxe': 'Budget luxe'
  };

  advice.push({
    type: 'tip',
    message: `Vous êtes dans la catégorie "${categoryNames[category]}".`,
    action: 'Parfait pour un cadeau mémorable sans se ruiner !'
  });

  return advice;
}

// @desc    Upload image pour un pack
// @route   POST /api/v1/packs/:id/images
// @access  Private/Admin
exports.uploadPackImage = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id);

  if (!pack) {
    res.status(404);
    throw new Error('Pack introuvable');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Aucune image fournie');
  }

  const imageData = {
    url: req.file.path,
    publicId: req.file.filename,
    alt: req.body.alt || pack.name,
    isPrimary: req.body.isPrimary === 'true' || pack.images.length === 0
  };

  // Si c'est l'image principale, retirer le flag des autres
  if (imageData.isPrimary) {
    pack.images.forEach(img => img.isPrimary = false);
    pack.image = {
      url: imageData.url,
      publicId: imageData.publicId,
      alt: imageData.alt
    };
  }

  pack.images.push(imageData);
  await pack.save();

  res.status(200).json({
    success: true,
    data: pack
  });
});

// @desc    Obtenir les statistiques des packs
// @route   GET /api/v1/packs/statistics
// @access  Private/Admin
exports.getPackStatistics = asyncHandler(async (req, res) => {
  const stats = await Pack.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$metadata.revenue' },
        totalPurchases: { $sum: '$metadata.purchases' },
        avgPrice: { $avg: '$packPrice' },
        avgDiscount: { $avg: '$discountPercentage' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);

  const bestsellers = await Pack.find({ isActive: true })
    .sort({ 'metadata.purchases': -1 })
    .limit(10)
    .select('name packPrice metadata.purchases metadata.revenue discountPercentage');

  const totalPacks = await Pack.countDocuments({ isActive: true });
  const totalRevenue = await Pack.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$metadata.revenue' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPacks,
      totalRevenue: totalRevenue[0]?.total || 0,
      byCategory: stats,
      bestsellers
    }
  });
});

module.exports = exports;