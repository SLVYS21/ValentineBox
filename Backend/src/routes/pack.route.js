const express = require('express');
const router = express.Router();
const {
  getPacks,
  getPack,
  createPack,
  updatePack,
  deletePack,
  searchPacksByBudget,
  uploadPackImage,
  getPackStatistics
} = require('../controllers/pack.controller');
const { upload } = require('../middlewares/upload');
const { protect, checkPermission } = require('../middlewares/auth');

// Routes publiques
router.get('/', getPacks);
router.get('/search/by-budget', searchPacksByBudget);
router.get('/statistics', protect, checkPermission('view_dashboard'), getPackStatistics);
router.get('/:id', getPack);

// Routes admin protégées
router.post('/', protect, checkPermission('manage_products'), createPack);
router.put('/:id', protect, checkPermission('manage_products'), updatePack);
router.delete('/:id', protect, checkPermission('manage_products'), deletePack);

// Gestion des images (admin)
router.post('/:id/images', protect, checkPermission('manage_products'), upload.single('image'), uploadPackImage);

module.exports = router;