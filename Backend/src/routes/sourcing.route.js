const express = require('express');
const { protect, checkPermission } = require('../middlewares/auth');

// ========== SOURCING ROUTES ==========
const sourcingRouter = express.Router();
const {
  getSourcings,
  getSourcing,
  createSourcing,
  updateSourcing,
  updateSourcingStatus,
  receiveItem,
  getSourcingStatistics
} = require('../controllers/sourcing.transaction.controller');

// Toutes les routes de sourcing sont protégées (admin uniquement)
sourcingRouter.use(protect, checkPermission('manage_sourcing'));

sourcingRouter.get('/', getSourcings);
sourcingRouter.get('/statistics', getSourcingStatistics);
sourcingRouter.get('/:id', getSourcing);
sourcingRouter.post('/', createSourcing);
sourcingRouter.put('/:id', updateSourcing);
sourcingRouter.patch('/:id/status', updateSourcingStatus);
sourcingRouter.patch('/:id/items/:itemId/receive', receiveItem);

module.exports = sourcingRouter;
