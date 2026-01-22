const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middlewares/auth');

// Routes publiques
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Routes protégées
router.use(protect); // Toutes les routes suivantes nécessitent une authentification

router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword);

// Routes super admin uniquement
router.post('/register', authorize('super_admin'), register);
router.get('/users', authorize('super_admin'), getUsers);
router.put('/users/:id', authorize('super_admin'), updateUser);
router.delete('/users/:id', authorize('super_admin'), deleteUser);

module.exports = router;