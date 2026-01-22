const asyncHandler = require('express-async-handler');
const Sourcing = require('../models/sourcing.model');
const Transaction = require('../models/transaction.model');

// @desc    Obtenir tous les sourcings
// @route   GET /api/v1/sourcing
// @access  Private/Admin
exports.getSourcings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    supplier,
    startDate,
    endDate
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (supplier) query['supplier.name'] = { $regex: supplier, $options: 'i' };

  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [sourcings, total] = await Promise.all([
    Sourcing.find(query)
      .populate('items.product', 'name category')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Sourcing.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: sourcings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: sourcings
  });
});

// @desc    Obtenir un sourcing par ID
// @route   GET /api/v1/sourcing/:id
// @access  Private/Admin
exports.getSourcing = asyncHandler(async (req, res) => {
  const sourcing = await Sourcing.findById(req.params.id)
    .populate('items.product', 'name category stock');

  if (!sourcing) {
    res.status(404);
    throw new Error('Sourcing introuvable');
  }

  res.status(200).json({
    success: true,
    data: sourcing
  });
});

// @desc    Créer un nouveau sourcing
// @route   POST /api/v1/sourcing
// @access  Private/Admin
exports.createSourcing = asyncHandler(async (req, res) => {
  const { items, supplier, expectedDeliveryDate, shippingCost, otherCosts, notes, createdBy } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Le sourcing doit contenir au moins un article');
  }

  // Calculer le coût total
  let totalCost = 0;
  const sourcingItems = [];

  for (const item of items) {
    const totalItemCost = item.unitCost * item.quantity;
    totalCost += totalItemCost;

    sourcingItems.push({
      ...item,
      totalCost: totalItemCost
    });
  }

  const sourcing = await Sourcing.create({
    items: sourcingItems,
    supplier,
    totalCost,
    expectedDeliveryDate,
    shippingCost: shippingCost || 0,
    otherCosts: otherCosts || 0,
    notes,
    createdBy: createdBy || 'admin'
  });

  res.status(201).json({
    success: true,
    data: sourcing
  });
});

// @desc    Mettre à jour un sourcing
// @route   PUT /api/v1/sourcing/:id
// @access  Private/Admin
exports.updateSourcing = asyncHandler(async (req, res) => {
  let sourcing = await Sourcing.findById(req.params.id);

  if (!sourcing) {
    res.status(404);
    throw new Error('Sourcing introuvable');
  }

  if (sourcing.status === 'received') {
    res.status(400);
    throw new Error('Un sourcing reçu ne peut plus être modifié');
  }

  sourcing = await Sourcing.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: sourcing
  });
});

// @desc    Mettre à jour le statut d'un sourcing
// @route   PATCH /api/v1/sourcing/:id/status
// @access  Private/Admin
exports.updateSourcingStatus = asyncHandler(async (req, res) => {
  const { status, notes, updatedBy } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Le statut est requis');
  }

  const sourcing = await Sourcing.findById(req.params.id);

  if (!sourcing) {
    res.status(404);
    throw new Error('Sourcing introuvable');
  }

  await sourcing.updateStatus(status, notes, updatedBy);

  res.status(200).json({
    success: true,
    data: sourcing
  });
});

// @desc    Marquer un article comme reçu
// @route   PATCH /api/v1/sourcing/:id/items/:itemId/receive
// @access  Private/Admin
exports.receiveItem = asyncHandler(async (req, res) => {
  const { receivedQuantity } = req.body;

  if (!receivedQuantity || receivedQuantity <= 0) {
    res.status(400);
    throw new Error('La quantité reçue doit être supérieure à zéro');
  }

  const sourcing = await Sourcing.findById(req.params.id);

  if (!sourcing) {
    res.status(404);
    throw new Error('Sourcing introuvable');
  }

  await sourcing.receiveItem(req.params.itemId, receivedQuantity);

  res.status(200).json({
    success: true,
    data: sourcing
  });
});

// @desc    Obtenir les statistiques de sourcing
// @route   GET /api/v1/sourcing/statistics
// @access  Private/Admin
exports.getSourcingStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const statistics = await Sourcing.getStatistics(startDate, endDate);

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// ========== TRANSACTION CONTROLLER ==========

// @desc    Obtenir toutes les transactions
// @route   GET /api/v1/transactions
// @access  Private/Admin
exports.getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type,
    category,
    account,
    startDate,
    endDate,
    status
  } = req.query;

  const query = { status: status || 'completed' };

  if (type) query.type = type;
  if (category) query.category = category;
  if (account) query.account = account;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedDocument.id', 'orderNumber sourcingNumber'),
    Transaction.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

// @desc    Obtenir une transaction par ID
// @route   GET /api/v1/transactions/:id
// @access  Private/Admin
exports.getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('relatedDocument.id');

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction introuvable');
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Créer une transaction manuelle
// @route   POST /api/v1/transactions
// @access  Private/Admin
exports.createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    relatedDocument: {
      model: 'Manual'
    }
  });

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Mettre à jour une transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private/Admin
exports.updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction introuvable');
  }

  if (transaction.relatedDocument.model !== 'Manual') {
    res.status(400);
    throw new Error('Seules les transactions manuelles peuvent être modifiées');
  }

  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Supprimer une transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private/Admin
exports.deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction introuvable');
  }

  if (transaction.relatedDocument.model !== 'Manual') {
    res.status(400);
    throw new Error('Seules les transactions manuelles peuvent être supprimées');
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtenir le solde d'un compte
// @route   GET /api/v1/transactions/balance/:account?
// @access  Private/Admin
exports.getAccountBalance = asyncHandler(async (req, res) => {
  const { account } = req.params;
  const { endDate } = req.query;

  const balance = await Transaction.getAccountBalance(
    account !== 'all' ? account : null,
    endDate
  );

  res.status(200).json({
    success: true,
    data: balance
  });
});

// @desc    Obtenir les statistiques par catégorie
// @route   GET /api/v1/transactions/statistics/category
// @access  Private/Admin
exports.getCategoryStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const statistics = await Transaction.getCategoryStatistics(startDate, endDate, type);

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// @desc    Obtenir les statistiques mensuelles
// @route   GET /api/v1/transactions/statistics/monthly/:year
// @access  Private/Admin
exports.getMonthlyStatistics = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const statistics = await Transaction.getMonthlyStatistics(parseInt(year));

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// @desc    Obtenir le dashboard financier
// @route   GET /api/v1/transactions/dashboard
// @access  Private/Admin
exports.getFinancialDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dashboard = await Transaction.getDashboard(startDate, endDate);

  res.status(200).json({
    success: true,
    data: dashboard
  });
});

module.exports = exports;