const express = require('express');
const { protect, checkPermission } = require('../middlewares/auth');

// ========== TRANSACTION ROUTES ==========
const transactionRouter = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccountBalance,
  getCategoryStatistics,
  getMonthlyStatistics,
  getFinancialDashboard
} = require('../controllers/sourcing.transaction.controller');

// Toutes les routes de transactions sont protégées (admin uniquement)
transactionRouter.use(protect, checkPermission('manage_transactions'));

transactionRouter.get('/', getTransactions);
transactionRouter.get('/dashboard', getFinancialDashboard);
transactionRouter.get('/balance/:account?', getAccountBalance);
transactionRouter.get('/statistics/category', getCategoryStatistics);
transactionRouter.get('/statistics/monthly/:year', getMonthlyStatistics);
transactionRouter.get('/:id', getTransaction);
transactionRouter.post('/', createTransaction);
transactionRouter.put('/:id', updateTransaction);
transactionRouter.delete('/:id', deleteTransaction);

module.exports = transactionRouter;
