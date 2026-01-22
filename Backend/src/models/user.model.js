const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut
  },
  
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  
  permissions: [{
    type: String,
    enum: [
      'manage_products',
      'manage_orders',
      'manage_sourcing',
      'manage_transactions',
      'manage_users',
      'view_dashboard',
      'manage_settings'
    ]
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockedUntil: {
    type: Date
  },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
//userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier si le compte est verrouillé
userSchema.methods.isLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion
userSchema.methods.incrementLoginAttempts = async function() {
  // Si le verrouillage a expiré, réinitialiser
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockedUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Verrouiller après 5 tentatives échouées (30 minutes)
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockedUntil: Date.now() + 30 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Méthode pour réinitialiser les tentatives de connexion
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockedUntil: 1 }
  });
};

// Méthode pour vérifier les permissions
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') {
    return true; // Super admin a tous les droits
  }
  return this.permissions.includes(permission);
};

// Définir les permissions par défaut selon le rôle
userSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.role === 'super_admin') {
      this.permissions = [
        'manage_products',
        'manage_orders',
        'manage_sourcing',
        'manage_transactions',
        'manage_users',
        'view_dashboard',
        'manage_settings'
      ];
    } else if (this.role === 'admin' && this.permissions.length === 0) {
      this.permissions = [
        'manage_products',
        'manage_orders',
        'view_dashboard'
      ];
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);