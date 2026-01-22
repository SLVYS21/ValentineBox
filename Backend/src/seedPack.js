require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Pack = require('../src/models/pack.model');
const Product = require('../src/models/product.model');

const samplePacks = async () => {
  try {
    await connectDB();
    
    console.log('🎁 Création des packs d\'exemple...\n');

    // Récupérer quelques produits pour créer les packs
    const products = await Product.find({ isActive: true }).limit(20);
    
    if (products.length < 10) {
      console.log('⚠️  Pas assez de produits. Lancez d\'abord: npm run seed');
      process.exit(1);
    }

    // Supprimer les packs existants
    await Pack.deleteMany({});
    console.log('🗑️  Packs existants supprimés\n');

    // PACK 1: Petit Budget - Douceur Simple (< 15,000 FCFA)
    const pack1Items = products.slice(0, 2);
    const pack1OriginalPrice = pack1Items.reduce((sum, p) => sum + p.price, 0);
    
    const pack1 = await Pack.create({
      name: 'Pack Douceur Simple',
      slug: 'pack-douceur-simple',
      description: 'Un petit geste qui fait plaisir ! Parfait pour une attention délicate sans se ruiner. Ce pack combine deux produits soigneusement sélectionnés pour créer un moment de douceur.',
      shortDescription: 'Petit budget, grand effet ! 💕',
      items: pack1Items.map(p => ({
        product: p._id,
        quantity: 1,
        priceAtCreation: p.price
      })),
      originalPrice: pack1OriginalPrice,
      packPrice: Math.round(pack1OriginalPrice * 0.85), // 15% de réduction
      budgetRange: { min: 8000, max: 15000 },
      category: 'petit_budget',
      occasion: 'saint_valentin',
      theme: 'classique',
      tags: ['économique', 'simple', 'élégant'],
      highlights: [
        'Parfait pour petit budget',
        '15% d\'économies',
        'Livraison rapide'
      ],
      badge: 'bestseller',
      isActive: true,
      isFeatured: true
    });

    // PACK 2: Budget Moyen - Romance Complète (15,000 - 30,000 FCFA)
    const pack2Items = products.slice(2, 5);
    const pack2OriginalPrice = pack2Items.reduce((sum, p) => sum + p.price, 0);
    
    const pack2 = await Pack.create({
      name: 'Pack Romance Complète',
      slug: 'pack-romance-complete',
      description: 'L\'ensemble parfait pour déclarer sa flamme ! Ce pack combine fleurs, chocolats et un cadeau surprise pour créer un moment inoubliable. Une combinaison gagnante testée et approuvée.',
      shortDescription: 'Le trio gagnant de la Saint-Valentin 🌹🍫🎁',
      items: pack2Items.map(p => ({
        product: p._id,
        quantity: 1,
        priceAtCreation: p.price
      })),
      originalPrice: pack2OriginalPrice,
      packPrice: Math.round(pack2OriginalPrice * 0.80), // 20% de réduction
      budgetRange: { min: 15000, max: 30000 },
      category: 'budget_moyen',
      occasion: 'saint_valentin',
      theme: 'romantique',
      tags: ['complet', 'romantique', 'populaire'],
      highlights: [
        'Notre pack le plus populaire',
        '20% d\'économies',
        'Trio fleurs + chocolats + cadeau',
        'Carte de vœux incluse'
      ],
      badge: 'bestseller',
      isActive: true,
      isFeatured: true,
      customization: {
        allowPersonalization: true,
        personalizationFee: 1000,
        personalizationOptions: ['Message personnalisé sur la carte', 'Emballage cadeau premium']
      }
    });

    // PACK 3: Budget Confortable - Passion Intense (30,000 - 50,000 FCFA)
    const pack3Items = products.slice(5, 9);
    const pack3OriginalPrice = pack3Items.reduce((sum, p) => sum + p.price, 0);
    
    const pack3 = await Pack.create({
      name: 'Pack Passion Intense',
      slug: 'pack-passion-intense',
      description: 'Pour ceux qui veulent vraiment impressionner ! Un assortiment généreux de produits premium : bouquet de roses, chocolats fins, bijou délicat et une peluche adorable. L\'amour mérite ce qu\'il y a de mieux.',
      shortDescription: 'L\'amour dans toute sa splendeur 💎',
      items: pack3Items.map(p => ({
        product: p._id,
        quantity: 1,
        priceAtCreation: p.price
      })),
      originalPrice: pack3OriginalPrice,
      packPrice: Math.round(pack3OriginalPrice * 0.75), // 25% de réduction
      budgetRange: { min: 30000, max: 50000 },
      category: 'budget_confortable',
      occasion: 'saint_valentin',
      theme: 'luxe',
      tags: ['premium', 'complet', 'généreux'],
      highlights: [
        'Pack premium tout inclus',
        '25% d\'économies exceptionnelles',
        'Bouquet XL + 4 surprises',
        'Emballage luxe offert',
        'Livraison à l\'heure exacte'
      ],
      badge: 'exclusive',
      isActive: true,
      isFeatured: true,
      customization: {
        allowPersonalization: true,
        personalizationFee: 2000,
        personalizationOptions: [
          'Message personnalisé calligraphié',
          'Emballage premium personnalisé',
          'Vidéo de déballage surprise'
        ]
      },
      delivery: {
        requiresSpecialHandling: true,
        specialHandlingFee: 2000,
        estimatedDeliveryDays: 1
      }
    });

    // PACK 4: Budget Premium - Déclaration Royale (50,000 - 100,000 FCFA)
    const pack4Items = products.slice(9, 14);
    const pack4OriginalPrice = pack4Items.reduce((sum, p) => sum + p.price, 0);
    
    const pack4 = await Pack.create({
      name: 'Pack Déclaration Royale',
      slug: 'pack-declaration-royale',
      description: 'Le summum du romantisme ! Une sélection exclusive de nos meilleurs produits : roses premium, chocolats artisanaux, bijoux fins, parfum de luxe et bien plus. Pour une déclaration qu\'elle n\'oubliera jamais.',
      shortDescription: 'Quand l\'amour n\'a pas de prix 👑',
      items: pack4Items.map(p => ({
        product: p._id,
        quantity: 1,
        priceAtCreation: p.price
      })),
      originalPrice: pack4OriginalPrice,
      packPrice: Math.round(pack4OriginalPrice * 0.70), // 30% de réduction
      budgetRange: { min: 50000, max: 100000 },
      category: 'budget_premium',
      occasion: 'declaration',
      theme: 'luxe',
      tags: ['luxe', 'exclusif', 'complet', 'premium'],
      highlights: [
        'Collection exclusive premium',
        '30% de réduction exceptionnelle',
        '5+ produits de luxe',
        'Coffret premium personnalisé',
        'Livraison VIP avec mise en scène',
        'Photographe optionnel'
      ],
      badge: 'exclusive',
      isActive: true,
      isFeatured: true,
      customization: {
        allowPersonalization: true,
        personalizationFee: 5000,
        personalizationOptions: [
          'Message calligraphié sur parchemin',
          'Coffret gravé avec vos initiales',
          'Mise en scène romantique surprise',
          'Session photo professionnelle'
        ]
      },
      delivery: {
        requiresSpecialHandling: true,
        specialHandlingFee: 5000,
        estimatedDeliveryDays: 2
      }
    });

    // PACK 5: Pack Spécial Gourmand
    const gourmandItems = products.filter(p => 
      p.category === 'chocolats' || p.category === 'coffrets'
    ).slice(0, 3);
    
    if (gourmandItems.length >= 2) {
      const pack5OriginalPrice = gourmandItems.reduce((sum, p) => sum + p.price, 0);
      
      await Pack.create({
        name: 'Pack Gourmand Délice',
        slug: 'pack-gourmand-delice',
        description: 'Pour les amoureux de chocolat ! Une sélection de nos meilleurs chocolats et friandises. Parce que l\'amour passe aussi par les papilles.',
        shortDescription: 'Le paradis des gourmands 🍫',
        items: gourmandItems.map(p => ({
          product: p._id,
          quantity: 1,
          priceAtCreation: p.price
        })),
        originalPrice: pack5OriginalPrice,
        packPrice: Math.round(pack5OriginalPrice * 0.82),
        budgetRange: { min: 12000, max: 25000 },
        category: 'budget_moyen',
        occasion: 'toutes_occasions',
        theme: 'gourmand',
        tags: ['chocolat', 'gourmand', 'délicieux'],
        highlights: [
          'Sélection de chocolats fins',
          '18% d\'économies',
          'Parfait pour les gourmands'
        ],
        badge: 'new',
        isActive: true,
        isFeatured: false
      });
    }

    // PACK 6: Pack Réconciliation
    const reconItems = products.slice(0, 3);
    const pack6OriginalPrice = reconItems.reduce((sum, p) => sum + p.price, 0);
    
    await Pack.create({
      name: 'Pack Pardon & Réconciliation',
      slug: 'pack-pardon-reconciliation',
      description: 'Pour se faire pardonner avec élégance. Un ensemble pensé pour renouer le dialogue et retrouver la complicité. Les gestes parlent parfois plus que les mots.',
      shortDescription: 'Le pardon en trois gestes 💐',
      items: reconItems.map(p => ({
        product: p._id,
        quantity: 1,
        priceAtCreation: p.price
      })),
      originalPrice: pack6OriginalPrice,
      packPrice: Math.round(pack6OriginalPrice * 0.88),
      budgetRange: { min: 15000, max: 35000 },
      category: 'budget_moyen',
      occasion: 'reconciliation',
      theme: 'romantique',
      tags: ['pardon', 'excuse', 'réconciliation'],
      highlights: [
        'Geste de réconciliation',
        '12% de réduction',
        'Message d\'excuse personnalisé offert'
      ],
      badge: 'new',
      isActive: true,
      isFeatured: false,
      customization: {
        allowPersonalization: true,
        personalizationFee: 0,
        personalizationOptions: ['Message d\'excuse personnalisé']
      }
    });

    console.log('✅ Packs créés avec succès!\n');
    
    const allPacks = await Pack.find();
    console.log(`📦 Nombre de packs créés: ${allPacks.length}\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 RÉSUMÉ DES PACKS CRÉÉS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const pack of allPacks) {
      await pack.calculateAvailableQuantity();
      await pack.save();
      
      console.log(`🎁 ${pack.name}`);
      console.log(`   Catégorie: ${pack.category}`);
      console.log(`   Prix original: ${pack.originalPrice.toLocaleString()} FCFA`);
      console.log(`   Prix pack: ${pack.packPrice.toLocaleString()} FCFA`);
      console.log(`   Économies: ${pack.discount.toLocaleString()} FCFA (${pack.discountPercentage}%)`);
      console.log(`   Budget: ${pack.budgetRange.min.toLocaleString()} - ${pack.budgetRange.max.toLocaleString()} FCFA`);
      console.log(`   Produits: ${pack.items.length}`);
      console.log(`   Stock disponible: ${pack.availableQuantity} pack(s)`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ Packs prêts à être utilisés!');
    console.log('\n💡 Testez la recherche:');
    console.log('   GET /api/v1/packs/search/by-budget?budget=20000');
    console.log('   GET /api/v1/packs?category=budget_moyen');
    console.log('═══════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

samplePacks();