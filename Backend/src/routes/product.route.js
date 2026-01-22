const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  adjustStock,
  getStockHistory,
  getStockStatistics,
  getStockAlerts
} = require('../controllers/product.controller');
const { searchByBudget } = require('../controllers/budgetsearch.controller');
const { upload } = require('../middlewares/upload');
const { protect, checkPermission } = require('../middlewares/auth');

// Routes publiques
router.get('/', getProducts);
router.get('/search/by-budget', searchByBudget); // Nouvelle route de recherche par budget
router.get('/:id', getProduct);

// Routes admin protégées
router.post('/', protect, checkPermission('manage_products'), createProduct);
router.put('/:id', protect, checkPermission('manage_products'), updateProduct);
router.delete('/:id', protect, checkPermission('manage_products'), deleteProduct);

// Gestion des images (admin)
router.post('/:id/images', protect, checkPermission('manage_products'), upload.single('image'), uploadProductImage);
router.delete('/:id/images/:imageId', protect, checkPermission('manage_products'), deleteProductImage);

// Gestion du stock (admin)
router.post('/:id/stock/adjust', protect, checkPermission('manage_products'), adjustStock);
router.get('/:id/stock/history', protect, checkPermission('manage_products'), getStockHistory);
router.get('/:id/stock/statistics', protect, checkPermission('manage_products'), getStockStatistics);
router.get('/stock/alerts', protect, checkPermission('manage_products'), getStockAlerts);

module.exports = router;