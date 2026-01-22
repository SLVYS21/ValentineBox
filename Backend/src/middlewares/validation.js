const Joi = require('joi');

// Validation pour la création d'un produit
const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(200),
    description: Joi.string().required().max(2000),
    price: Joi.number().required().min(0),
    category: Joi.string().required().valid('bouquets', 'chocolats', 'peluches', 'bijoux', 'parfums', 'coffrets', 'autres'),
    stock: Joi.object({
      quantity: Joi.number().min(0).default(0),
      threshold: Joi.number().min(0).default(10)
    }),
    tags: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validation pour la création d'une commande
const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().required().min(1)
      })
    ).required().min(1),
    customer: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().allow(''),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        district: Joi.string(),
        landmark: Joi.string()
      })
    }).required(),
    delivery: Joi.object({
      type: Joi.string().valid('pickup', 'delivery').default('delivery'),
      date: Joi.date(),
      timeSlot: Joi.string(),
      address: Joi.string(),
      instructions: Joi.string(),
      fee: Joi.number().min(0).default(0)
    }),
    payment: Joi.object({
      method: Joi.string().required().valid('cash', 'momo', 'bank_transfer', 'card'),
      status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending')
    }).required(),
    notes: Joi.string().max(1000),
    discount: Joi.number().min(0).default(0)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validation pour la création d'un sourcing
const validateSourcing = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().required().min(1),
        unitCost: Joi.number().required().min(0),
        notes: Joi.string()
      })
    ).required().min(1),
    supplier: Joi.object({
      name: Joi.string().required(),
      contact: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
      address: Joi.string()
    }).required(),
    expectedDeliveryDate: Joi.date(),
    payment: Joi.object({
      method: Joi.string().valid('cash', 'bank_transfer', 'credit', 'momo'),
      status: Joi.string().valid('pending', 'partial', 'paid').default('pending')
    }),
    shippingCost: Joi.number().min(0).default(0),
    otherCosts: Joi.number().min(0).default(0),
    notes: Joi.string().max(2000),
    createdBy: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validation pour la création d'une transaction
const validateTransaction = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string().required().valid('income', 'expense'),
    category: Joi.string().required().valid(
      'sales', 'refund_received', 'other_income',
      'sourcing', 'delivery', 'marketing', 'packaging', 'rent', 
      'utilities', 'salaries', 'refund_given', 'other_expense'
    ),
    amount: Joi.number().required().min(0),
    description: Joi.string().required().max(500),
    paymentMethod: Joi.string().required().valid('cash', 'momo', 'bank_transfer', 'card', 'credit'),
    date: Joi.date().default(Date.now),
    account: Joi.string().valid('main_cash', 'momo_account', 'bank_account', 'card_terminal').default('main_cash'),
    notes: Joi.string().max(1000),
    performedBy: Joi.string().required(),
    tags: Joi.array().items(Joi.string())
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateProduct,
  validateOrder,
  validateSourcing,
  validateTransaction
};