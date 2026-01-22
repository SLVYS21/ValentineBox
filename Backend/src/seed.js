require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product.model');
const connectDB = require('../src/config/database');

const sampleProducts = [
  {
    name: "Bouquet Romantique Premium",
    description: "Un magnifique bouquet de 50 roses rouges fraîches, symbole de l'amour éternel. Parfait pour déclarer votre flamme ou célébrer votre amour.",
    price: 25000,
    category: "bouquets",
    stock: {
      quantity: 30,
      threshold: 5
    },
    tags: ["roses", "rouge", "premium", "romantique"],
    isActive: true,
    isFeatured: true,
    images: [] // À ajouter manuellement via l'API
  },
  {
    name: "Bouquet Passion",
    description: "Mélange élégant de roses rouges et roses, avec des lys blancs. Un bouquet qui exprime toute la passion de votre amour.",
    price: 18000,
    category: "bouquets",
    stock: {
      quantity: 45,
      threshold: 10
    },
    tags: ["roses", "lys", "mélange", "passion"],
    isActive: true,
    isFeatured: true,
    images: []
  },
  {
    name: "Coffret Chocolats Artisanaux",
    description: "24 chocolats fins artisanaux aux saveurs variées : praliné, ganache, caramel. Présentés dans un élégant coffret rouge.",
    price: 12000,
    category: "chocolats",
    stock: {
      quantity: 60,
      threshold: 15
    },
    tags: ["artisanal", "praliné", "ganache", "luxe"],
    isActive: true,
    isFeatured: false,
    images: []
  },
  {
    name: "Peluche Ours Géant 80cm",
    description: "Grand ours en peluche doux et câlin de 80cm, tenant un cœur brodé 'I Love You'. Irrésistible !",
    price: 15000,
    category: "peluches",
    stock: {
      quantity: 25,
      threshold: 5
    },
    tags: ["ours", "géant", "doux", "câlin"],
    isActive: true,
    isFeatured: true,
    images: []
  },
  {
    name: "Bracelet Argent Cœur Gravé",
    description: "Bracelet en argent sterling 925 avec pendentif cœur. Possibilité de gravure personnalisée des initiales.",
    price: 35000,
    category: "bijoux",
    stock: {
      quantity: 15,
      threshold: 3
    },
    tags: ["argent", "cœur", "gravure", "bijou"],
    isActive: true,
    isFeatured: false,
    images: []
  },
  {
    name: "Collier Pendentif Infini",
    description: "Collier élégant en argent avec pendentif symbole de l'infini, serti de zircons. Symbolise un amour éternel.",
    price: 28000,
    category: "bijoux",
    stock: {
      quantity: 20,
      threshold: 5
    },
    tags: ["argent", "infini", "zircon", "éternel"],
    isActive: true,
    isFeatured: true,
    images: []
  },
  {
    name: "Parfum Femme Romance",
    description: "Eau de parfum féminine aux notes florales et fruitées. Flacon 50ml élégant. Parfait pour une femme romantique.",
    price: 45000,
    category: "parfums",
    stock: {
      quantity: 12,
      threshold: 3
    },
    tags: ["femme", "floral", "romantique", "luxe"],
    isActive: true,
    isFeatured: false,
    images: []
  },
  {
    name: "Coffret Spa Romantique",
    description: "Coffret complet pour moment détente à deux : bougies parfumées, huiles de massage, pétales de roses, sels de bain.",
    price: 22000,
    category: "coffrets",
    stock: {
      quantity: 35,
      threshold: 8
    },
    tags: ["spa", "détente", "bougies", "massage"],
    isActive: true,
    isFeatured: true,
    images: []
  },
  {
    name: "Coffret Surprise Complet",
    description: "Le coffret ultime : bouquet de roses, chocolats fins, peluche et carte personnalisée. Tout pour impressionner !",
    price: 48000,
    category: "coffrets",
    stock: {
      quantity: 20,
      threshold: 5
    },
    tags: ["complet", "surprise", "premium", "tout-en-un"],
    isActive: true,
    isFeatured: true,
    images: []
  },
  {
    name: "Mini Bouquet Tendresse",
    description: "Petit bouquet délicat de 12 roses roses et blanches. Idéal pour un geste d'affection au quotidien.",
    price: 8000,
    category: "bouquets",
    stock: {
      quantity: 50,
      threshold: 10
    },
    tags: ["mini", "rose", "blanc", "délicat"],
    isActive: true,
    isFeatured: false,
    images: []
  },
  {
    name: "Carte Musicale Personnalisée",
    description: "Belle carte avec mécanisme musical (mélodie au choix) et espace pour message personnalisé. Souvenir mémorable.",
    price: 5000,
    category: "autres",
    stock: {
      quantity: 100,
      threshold: 20
    },
    tags: ["carte", "musique", "personnalisée", "souvenir"],
    isActive: true,
    isFeatured: false,
    images: []
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Suppression des anciennes données...');
    await Product.deleteMany({});
    
    console.log('🌱 Insertion des données de test...');
    const products = await Product.insertMany(sampleProducts);
    
    console.log(`✅ ${products.length} produits créés avec succès!`);
    
    console.log('\n📊 Résumé par catégorie:');
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock.quantity' }
        }
      }
    ]);
    
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} produits (${cat.totalStock} items en stock)`);
    });
    
    console.log('\n✨ Base de données initialisée avec succès!');
    console.log('Vous pouvez maintenant tester l\'API.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Exécuter le seed
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;