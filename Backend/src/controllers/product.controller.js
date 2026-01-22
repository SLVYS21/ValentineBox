const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const StockMovement = require('../models/stockmov.model');
const cloudinary = require('../config/cloudinary');

// @desc    Obtenir tous les produits
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    status,
    sortBy = '-createdAt',
    isActive,
    isFeatured
  } = req.query;

  const query = {};

  // Filtres
  if (category) query.category = category;
  if (status) query['stock.status'] = status;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

  // Recherche textuelle
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Product.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Obtenir un produit par ID
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  // Incrémenter le compteur de vues
  product.metadata.views += 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Créer un nouveau produit
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Mettre à jour un produit
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Supprimer un produit
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  // Supprimer les images de Cloudinary
  for (const image of product.images) {
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload image pour un produit
// @route   POST /api/v1/products/:id/images
// @access  Private/Admin
exports.uploadProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Veuillez fournir une image');
  }

  const isPrimary = product.images.length === 0 || req.body.is_primary === 'true';

  // Si cette image doit être principale, retirer le flag des autres
  if (isPrimary) {
    product.images.forEach(img => img.is_primary = false);
  }

  product.images.push({
    public_id: req.file.filename,
    url: req.file.path,
    is_primary: isPrimary
  });

  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Supprimer une image d'un produit
// @route   DELETE /api/v1/products/:id/images/:imageId
// @access  Private/Admin
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const image = product.images.id(req.params.imageId);

  if (!image) {
    res.status(404);
    throw new Error('Image introuvable');
  }

  // Supprimer de Cloudinary
  if (image.public_id) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  image.deleteOne();
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Ajuster le stock manuellement
// @route   POST /api/v1/products/:id/stock/adjust
// @access  Private/Admin
exports.adjustStock = asyncHandler(async (req, res) => {
  const { quantity, reason, performedBy } = req.body;

  if (!quantity || quantity === 0) {
    res.status(400);
    throw new Error('La quantité est requise et ne peut pas être zéro');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const previousQuantity = product.stock.quantity;
  const newQuantity = previousQuantity + quantity;

  if (newQuantity < 0) {
    res.status(400);
    throw new Error('Le stock ne peut pas être négatif');
  }

  // Créer un mouvement de stock
  await StockMovement.create({
    product: product._id,
    type: 'adjustment',
    quantity,
    previousQuantity,
    newQuantity,
    reason,
    performedBy: performedBy || 'admin'
  });

  // Mettre à jour le stock
  product.stock.quantity = newQuantity;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Obtenir l'historique du stock d'un produit
// @route   GET /api/v1/products/:id/stock/history
// @access  Private/Admin
exports.getStockHistory = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const history = await StockMovement.getProductHistory(req.params.id, parseInt(limit));

  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

// @desc    Obtenir les statistiques du stock
// @route   GET /api/v1/products/:id/stock/statistics
// @access  Private/Admin
exports.getStockStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const statistics = await StockMovement.getStockStatistics(
    req.params.id,
    startDate,
    endDate
  );

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// @desc    Obtenir les produits en rupture de stock ou stock faible
// @route   GET /api/v1/products/stock/alerts
// @access  Private/Admin
exports.getStockAlerts = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({
    'stock.status': { $in: ['low_stock', 'out_of_stock'] },
    isActive: true
  }).select('name stock category images');

  res.status(200).json({
    success: true,
    count: lowStock.length,
    data: lowStock
  });
});