const express = require('express');
const { protect, checkPermission } = require('../middlewares/auth');

// ========== ORDER ROUTES ==========
const orderRouter = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderItems,
  cancelOrder,
  getOrderStatistics,
  getTodayOrders
} = require('../controllers/order.controller');

// Routes publiques (création de commande)
orderRouter.post('/', createOrder);

// Routes admin protégées
orderRouter.get('/', protect, checkPermission('manage_orders'), getOrders);
orderRouter.get('/statistics', protect, checkPermission('manage_orders'), getOrderStatistics);
orderRouter.get('/today', protect, checkPermission('manage_orders'), getTodayOrders);
orderRouter.get('/:id', protect, checkPermission('manage_orders'), getOrder);
orderRouter.put('/:id', protect, checkPermission('manage_orders'), updateOrder);
orderRouter.put('/:id/items', protect, checkPermission('manage_orders'), updateOrderItems);
orderRouter.patch('/:id/status', protect, checkPermission('manage_orders'), updateOrderStatus);
orderRouter.patch('/:id/payment', protect, checkPermission('manage_orders'), updatePaymentStatus);
orderRouter.delete('/:id', protect, checkPermission('manage_orders'), cancelOrder);


module.exports = orderRouter
