const asyncHandler = require('express-async-handler');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Transaction = require('../models/transaction.model');

// @desc    Obtenir toutes les commandes
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    search
  } = req.query;

  const query = {};

  if (status) query.status = status;
  
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: orders
  });
});

// @desc    Obtenir une commande par ID
// @route   GET /api/v1/orders/:id
// @access  Private/Admin
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name category images');

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Créer une nouvelle commande
// @route   POST /api/v1/orders
// @access  Public
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, customer, delivery, payment, notes, discount = 0 } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('La commande doit contenir au moins un article');
  }

  // Vérifier la disponibilité et calculer les montants
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Produit ${item.product} introuvable`);
    }

    if (!product.isAvailable(item.quantity)) {
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
      image: product.images.find(img => img.is_primary) || product.images[0]
    });
  }

  // Créer la commande
  const order = await Order.create({
    items: orderItems,
    totalAmount,
    customer,
    delivery: {
      ...delivery,
      fee: delivery?.fee || 0
    },
    payment,
    notes,
    discount
  });

  // Réserver le stock
  try {
    await order.reserveStock();
  } catch (error) {
    await order.deleteOne();
    res.status(400);
    throw new Error(error.message);
  }

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour une commande
// @route   PUT /api/v1/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  // Ne pas permettre la modification si la commande est livrée ou annulée
  if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
    res.status(400);
    throw new Error('Cette commande ne peut plus être modifiée');
  }

  const allowedFields = ['customer', 'delivery', 'notes', 'internalNotes', 'discount'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  order = await Order.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes, updatedBy } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Le statut est requis');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  await order.updateStatus(status, notes, updatedBy);

  // Si la commande est livrée et payée, créer la transaction
  if (status === 'delivered' && order.payment.status === 'paid' && !order.transactionCreated) {
    await Transaction.createFromOrder(order);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour le statut de paiement
// @route   PATCH /api/v1/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  order.payment.status = paymentStatus;
  if (transactionId) order.payment.transactionId = transactionId;
  if (paymentStatus === 'paid') order.payment.paidAt = new Date();

  await order.save();

  // Créer la transaction si la commande est livrée et payée
  if (order.status === 'delivered' && paymentStatus === 'paid' && !order.transactionCreated) {
    await Transaction.createFromOrder(order);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Modifier les items d'une commande
// @route   PUT /api/v1/orders/:id/items
// @access  Private/Admin
exports.updateOrderItems = asyncHandler(async (req, res) => {
  const { items } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  // Ne pas permettre la modification si la commande est livrée ou annulée
  if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
    res.status(400);
    throw new Error('Les articles de cette commande ne peuvent plus être modifiés');
  }

  // Libérer le stock actuel
  if (order.stockReserved) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.releaseStock(item.quantity);
      }
    }
  }

  // Calculer les nouveaux montants
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Produit ${item.product} introuvable`);
    }

    if (!product.isAvailable(item.quantity)) {
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
      image: product.images.find(img => img.is_primary) || product.images[0]
    });
  }

  order.items = orderItems;
  order.totalAmount = totalAmount;
  order.stockReserved = false;
  await order.save();

  // Réserver le nouveau stock
  await order.reserveStock();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Annuler une commande
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason, cancelledBy } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  if (order.status === 'delivered') {
    res.status(400);
    throw new Error('Une commande livrée ne peut pas être annulée');
  }

  await order.updateStatus('cancelled', reason, cancelledBy);

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Obtenir les statistiques des commandes
// @route   GET /api/v1/orders/statistics
// @access  Private/Admin
exports.getOrderStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const statistics = await Order.getStatistics(startDate, endDate);

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// @desc    Obtenir les commandes d'aujourd'hui
// @route   GET /api/v1/orders/today
// @access  Private/Admin
exports.getTodayOrders = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders = await Order.find({
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('items.product', 'name category').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});