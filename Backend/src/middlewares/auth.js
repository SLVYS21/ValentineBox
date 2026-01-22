const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');

// Protéger les routes - vérifier si l'utilisateur est authentifié
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifier si le token est dans le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // S'assurer que le token existe
  if (!token) {
    res.status(401);
    throw new Error('Non autorisé - Token manquant');
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis le token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Non autorisé - Utilisateur introuvable');
    }

    // Vérifier si le compte est actif
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Compte désactivé');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Non autorisé - Token invalide');
  }
});

// Restreindre l'accès aux rôles spécifiques
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route`);
    }
    next();
  };
};

// Vérifier les permissions spécifiques
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.hasPermission(permission)) {
      res.status(403);
      throw new Error(`Vous n'avez pas la permission: ${permission}`);
    }
    next();
  };
};

// Middleware optionnel - ajouter l'utilisateur si authentifié, mais ne pas bloquer si non authentifié
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalide, mais on continue quand même
      req.user = null;
    }
  }

  next();
});