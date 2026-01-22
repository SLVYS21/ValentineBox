const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');

// Générer un JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Inscription d'un nouvel admin (uniquement par super admin)
// @route   POST /api/v1/auth/register
// @access  Private/SuperAdmin
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Cet email est déjà utilisé');
  }

  // Seul un super admin peut créer d'autres utilisateurs
  if (role === 'super_admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Seul un super admin peut créer un autre super admin');
  }

  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'admin',
    permissions: permissions || [],
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  });
});

// @desc    Connexion
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Email et mot de passe requis');
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Identifiants invalides');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    res.status(403);
    throw new Error('Compte désactivé. Contactez un administrateur.');
  }

  // Vérifier si le compte est verrouillé
  if (user.isLocked()) {
    const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    res.status(423);
    throw new Error(`Compte verrouillé pour ${remainingTime} minutes. Trop de tentatives échouées.`);
  }

  // Vérifier le mot de passe
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Incrémenter les tentatives échouées
    await user.incrementLoginAttempts();
    
    res.status(401);
    throw new Error('Identifiants invalides');
  }

  // Réinitialiser les tentatives de connexion
  await user.resetLoginAttempts();

  // Générer le token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  });
});

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour le profil
// @route   PUT /api/v1/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Changer le mot de passe
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Mot de passe actuel et nouveau mot de passe requis');
  }

  // Trouver l'utilisateur avec le mot de passe
  const user = await User.findById(req.user._id).select('+password');

  // Vérifier le mot de passe actuel
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Mot de passe actuel incorrect');
  }

  // Mettre à jour le mot de passe
  user.password = newPassword;
  await user.save();

  // Générer nouveau token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Mot de passe changé avec succès',
    token
  });
});

// @desc    Demander la réinitialisation du mot de passe
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('Aucun utilisateur avec cet email');
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash le token
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir l'expiration (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // En production, envoyer le token par email
  // Pour le développement, le retourner dans la réponse
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Email de réinitialisation envoyé',
    // À retirer en production
    resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
  });
});

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    res.status(400);
    throw new Error('Nouveau mot de passe requis');
  }

  // Hash le token de l'URL
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // Trouver l'utilisateur
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Token invalide ou expiré');
  }

  // Définir le nouveau mot de passe
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Générer nouveau token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
    token
  });
});

// @desc    Obtenir tous les utilisateurs (super admin)
// @route   GET /api/v1/auth/users
// @access  Private/SuperAdmin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Mettre à jour un utilisateur (super admin)
// @route   PUT /api/v1/auth/users/:id
// @access  Private/SuperAdmin
exports.updateUser = asyncHandler(async (req, res) => {
  const { isActive, role, permissions } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur introuvable');
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role) user.role = role;
  if (permissions) user.permissions = permissions;

  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Supprimer un utilisateur (super admin)
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/SuperAdmin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur introuvable');
  }

  // Ne pas permettre la suppression du dernier super admin
  if (user.role === 'super_admin') {
    const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
    if (superAdminCount <= 1) {
      res.status(400);
      throw new Error('Impossible de supprimer le dernier super admin');
    }
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = exports;