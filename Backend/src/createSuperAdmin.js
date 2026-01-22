require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../src/models/user.model');
const connectDB = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const createSuperAdmin = async () => {
  try {
    await connectDB();
    
    console.log('\n🔐 Création du premier Super Admin\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Vérifier s'il existe déjà un super admin
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Un super admin existe déjà:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Nom: ${existingSuperAdmin.name}\n`);
      
      const confirm = await question('Voulez-vous créer un autre super admin? (oui/non): ');
      
      if (confirm.toLowerCase() !== 'oui') {
        console.log('\n✋ Opération annulée.\n');
        process.exit(0);
      }
    }
    
    // Collecter les informations
    const name = await question('Nom complet: ');
    const email = await question('Email: ');
    const password = await question('Mot de passe (min 6 caractères): ');
    
    // Validation basique
    if (!name || !email || !password) {
      console.log('\n❌ Tous les champs sont requis!\n');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.log('\n❌ Le mot de passe doit contenir au moins 6 caractères!\n');
      process.exit(1);
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n❌ Cet email est déjà utilisé!\n');
      process.exit(1);
    }
    
    console.log('\n⏳ Création du super admin...\n');
    
    // Créer le super admin
    const superAdmin = await User.create({
      name,
      email,
      password,
      role: 'super_admin',
      permissions: [
        'manage_products',
        'manage_orders',
        'manage_sourcing',
        'manage_transactions',
        'manage_users',
        'view_dashboard',
        'manage_settings'
      ],
      isActive: true
    });
    
    console.log('✅ Super admin créé avec succès!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 INFORMATIONS DE CONNEXION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Nom: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Permissions: ${superAdmin.permissions.length} permissions`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 Vous pouvez maintenant vous connecter avec ces identifiants.');
    console.log('   Endpoint: POST /api/v1/auth/login');
    console.log('   Body: { "email": "' + email + '", "password": "..." }\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Exécuter
createSuperAdmin();