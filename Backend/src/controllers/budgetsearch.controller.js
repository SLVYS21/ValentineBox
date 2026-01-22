const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');

// @desc    Recherche intelligente de produits par budget
// @route   GET /api/v1/products/search/by-budget
// @access  Public
exports.searchByBudget = asyncHandler(async (req, res) => {
  const { budget, category, tags } = req.query;

  if (!budget) {
    res.status(400);
    throw new Error('Le budget est requis');
  }

  const budgetAmount = parseFloat(budget);
  
  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    res.status(400);
    throw new Error('Budget invalide');
  }

  // Construire la query de base
  const baseQuery = {
    isActive: true,
    'stock.status': { $ne: 'out_of_stock' }
  };

  if (category) {
    baseQuery.category = category;
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    baseQuery.tags = { $in: tagArray };
  }

  // ALGORITHME DE RECHERCHE INTELLIGENT PAR BUDGET

  // 1. Produits DANS le budget (70% - produits principaux)
  const withinBudgetQuery = {
    ...baseQuery,
    price: { $lte: budgetAmount }
  };

  // 2. Produits LÉGÈREMENT au-dessus (jusqu'à +20% - suggestion premium)
  const slightlyAboveQuery = {
    ...baseQuery,
    price: { 
      $gt: budgetAmount,
      $lte: budgetAmount * 1.20  // +20% du budget
    }
  };

  // 3. Produits MODÉRÉMENT au-dessus (jusqu'à +40% - stretch options)
  const moderatelyAboveQuery = {
    ...baseQuery,
    price: { 
      $gt: budgetAmount * 1.20,
      $lte: budgetAmount * 1.40  // +40% du budget
    }
  };

  // Exécuter les recherches en parallèle
  const [withinBudget, slightlyAbove, moderatelyAbove] = await Promise.all([
    Product.find(withinBudgetQuery)
      .sort({ isFeatured: -1, 'metadata.purchases': -1, price: -1 })
      .limit(15)
      .lean(),
    
    Product.find(slightlyAboveQuery)
      .sort({ isFeatured: -1, 'metadata.purchases': -1, price: 1 })
      .limit(5)
      .lean(),
    
    Product.find(moderatelyAboveQuery)
      .sort({ isFeatured: -1, 'metadata.purchases': -1, price: 1 })
      .limit(3)
      .lean()
  ]);

  // Calculer des métriques utiles
  const calculateBudgetMetrics = (products, targetBudget) => {
    if (products.length === 0) return null;

    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      count: products.length,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
      savingsPotential: Math.round(targetBudget - minPrice),
      extraNeeded: maxPrice > targetBudget ? Math.round(maxPrice - targetBudget) : 0
    };
  };

  // Ajouter des indicateurs de suggestion à chaque produit
  const enhanceProducts = (products, budget, type) => {
    return products.map(product => {
      const priceVsBudget = ((product.price - budget) / budget) * 100;
      
      let affordabilityTag;
      let suggestion;

      if (priceVsBudget <= 0) {
        affordabilityTag = 'affordable';
        const savings = Math.round(budget - product.price);
        suggestion = savings > 0 
          ? `Économisez ${savings} FCFA ! Parfait pour votre budget.`
          : 'Parfaitement adapté à votre budget.';
      } else if (priceVsBudget <= 10) {
        affordabilityTag = 'barely_above';
        const extra = Math.round(product.price - budget);
        suggestion = `Seulement ${extra} FCFA de plus pour un produit premium !`;
      } else if (priceVsBudget <= 20) {
        affordabilityTag = 'slightly_above';
        const extra = Math.round(product.price - budget);
        suggestion = `+${extra} FCFA pour une qualité supérieure. Ça vaut le coup !`;
      } else {
        affordabilityTag = 'stretch_option';
        const extra = Math.round(product.price - budget);
        suggestion = `Une option premium à +${extra} FCFA. Pour vraiment impressionner !`;
      }

      return {
        ...product,
        budgetInfo: {
          affordabilityTag,
          suggestion,
          priceVsBudget: Math.round(priceVsBudget),
          extraCost: product.price > budget ? Math.round(product.price - budget) : 0,
          savings: product.price < budget ? Math.round(budget - product.price) : 0
        }
      };
    });
  };

  // Enrichir les produits avec les informations de budget
  const enrichedWithinBudget = enhanceProducts(withinBudget, budgetAmount, 'within');
  const enrichedSlightlyAbove = enhanceProducts(slightlyAbove, budgetAmount, 'slightly_above');
  const enrichedModeratelyAbove = enhanceProducts(moderatelyAbove, budgetAmount, 'moderately_above');

  // Suggestions de combinaisons (bundles) dans le budget
  const bundles = [];
  if (withinBudget.length >= 2) {
    // Trouver des combinaisons de 2-3 produits qui rentrent dans le budget
    for (let i = 0; i < Math.min(withinBudget.length, 5); i++) {
      for (let j = i + 1; j < Math.min(withinBudget.length, 10); j++) {
        const totalPrice = withinBudget[i].price + withinBudget[j].price;
        
        if (totalPrice <= budgetAmount) {
          bundles.push({
            products: [
              { _id: withinBudget[i]._id, name: withinBudget[i].name, price: withinBudget[i].price },
              { _id: withinBudget[j]._id, name: withinBudget[j].name, price: withinBudget[j].price }
            ],
            totalPrice,
            savings: Math.round(budgetAmount - totalPrice),
            suggestion: `Combinez ces 2 produits et économisez ${Math.round(budgetAmount - totalPrice)} FCFA !`
          });
        }
      }
    }
    
    // Trier par économies et limiter à 5 suggestions
    bundles.sort((a, b) => b.savings - a.savings);
    bundles.splice(5);
  }

  // Réponse structurée
  res.status(200).json({
    success: true,
    budget: budgetAmount,
    summary: {
      totalProducts: withinBudget.length + slightlyAbove.length + moderatelyAbove.length,
      withinBudgetCount: withinBudget.length,
      aboveBudgetCount: slightlyAbove.length + moderatelyAbove.length,
      bundlesSuggested: bundles.length
    },
    recommendations: {
      // Produits dans le budget - section principale
      withinBudget: {
        title: `Produits dans votre budget (${budgetAmount} FCFA)`,
        description: 'Ces produits sont parfaits pour votre budget !',
        products: enrichedWithinBudget,
        metrics: calculateBudgetMetrics(withinBudget, budgetAmount)
      },
      
      // Produits légèrement au-dessus - incitation à l'upgrade
      slightlyAbove: {
        title: 'Quelques francs de plus, beaucoup plus de wow ! 🌟',
        description: 'Ces produits premium ne sont qu\'à quelques francs de votre budget',
        products: enrichedSlightlyAbove,
        metrics: calculateBudgetMetrics(slightlyAbove, budgetAmount),
        upsellMessage: slightlyAbove.length > 0 
          ? `Pour seulement ${Math.round(slightlyAbove[0].price - budgetAmount)} FCFA de plus, offrez un cadeau exceptionnel !`
          : null
      },

      // Produits modérément au-dessus - options stretch
      moderatelyAbove: {
        title: 'Options Premium - Pour vraiment impressionner 💎',
        description: 'Augmentez légèrement votre budget pour un effet maximal',
        products: enrichedModeratelyAbove,
        metrics: calculateBudgetMetrics(moderatelyAbove, budgetAmount),
        stretchMessage: moderatelyAbove.length > 0
          ? `Investissez ${Math.round(moderatelyAbove[0].price - budgetAmount)} FCFA de plus pour un cadeau inoubliable !`
          : null
      },

      // Suggestions de bundles
      bundles: {
        title: 'Combinez vos cadeaux ! 🎁+🎁',
        description: 'Créez un coffret personnalisé dans votre budget',
        suggestions: bundles,
        message: bundles.length > 0 
          ? 'Doublez la surprise sans dépasser votre budget !'
          : null
      }
    },
    
    // Conseils personnalisés
    personalizedAdvice: generatePersonalizedAdvice(
      budgetAmount, 
      withinBudget.length, 
      slightlyAbove.length,
      moderatelyAbove.length
    )
  });
});

// Fonction helper pour générer des conseils personnalisés
function generatePersonalizedAdvice(budget, withinCount, slightlyAboveCount, moderatelyAboveCount) {
  const advice = [];

  if (withinCount === 0) {
    advice.push({
      type: 'warning',
      message: `Aucun produit trouvé dans votre budget de ${budget} FCFA.`,
      action: 'Augmentez légèrement votre budget ou explorez nos promotions.'
    });
  } else if (withinCount < 3) {
    advice.push({
      type: 'info',
      message: 'Peu de choix dans ce budget.',
      action: `Augmentez de ${Math.round(budget * 0.2)} FCFA pour ${slightlyAboveCount} options supplémentaires.`
    });
  } else {
    advice.push({
      type: 'success',
      message: `Excellent ! ${withinCount} produits correspondent à votre budget.`,
      action: 'Vous avez le choix parmi nos meilleures sélections.'
    });
  }

  if (slightlyAboveCount > 0) {
    advice.push({
      type: 'upsell',
      message: `🌟 ${slightlyAboveCount} produits premium à portée de main !`,
      action: 'Un petit effort pour un grand effet. Ça vaut vraiment le coup !'
    });
  }

  if (moderatelyAboveCount > 0 && budget < 30000) {
    advice.push({
      type: 'premium',
      message: '💎 Pour un cadeau vraiment mémorable...',
      action: `Découvrez nos ${moderatelyAboveCount} options premium. L'amour n'a pas de prix !`
    });
  }

  return advice;
}

//module.exports = { searchByBudget };