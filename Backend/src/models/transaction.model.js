const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Le type de transaction est requis']
  },
  
  category: {
    type: String,
    enum: [
      // Revenus
      'sales',              // Ventes
      'refund_received',    // Remboursement reçu
      'other_income',       // Autre revenu
      
      // Dépenses
      'sourcing',           // Approvisionnement
      'delivery',           // Livraison
      'marketing',          // Marketing
      'packaging',          // Emballage
      'rent',              // Loyer
      'utilities',         // Services publics
      'salaries',          // Salaires
      'refund_given',      // Remboursement donné
      'other_expense'      // Autre dépense
    ],
    required: [true, 'La catégorie est requise']
  },
  
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 500
  },
  
  // Référence à un document lié (commande, sourcing, etc.)
  relatedDocument: {
    model: {
      type: String,
      enum: ['Order', 'Sourcing', 'Manual']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedDocument.model'
    }
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'momo', 'bank_transfer', 'card', 'credit'],
    required: [true, 'La méthode de paiement est requise']
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Informations de compte/caisse
  account: {
    type: String,
    enum: ['main_cash', 'momo_account', 'bank_account', 'card_terminal'],
    default: 'main_cash'
  },
  
  // Statut de la transaction
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'completed'
  },
  
  // Reçu ou preuve de paiement
  receipt: {
    url: String,
    public_id: String,
    uploadDate: Date
  },
  
  notes: {
    type: String,
    maxlength: 1000
  },
  
  performedBy: {
    type: String,
    required: [true, 'L\'auteur de la transaction est requis']
  },
  
  // Pour les transactions récurrentes
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDueDate: Date,
    endDate: Date
  },
  
  // Tags pour une meilleure organisation
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index pour recherche et performance
//transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ account: 1, date: -1 });

// Générer un numéro de transaction unique
transactionSchema.pre('validate', async function(next) {
  if (!this.transactionNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const count = await mongoose.model('Transaction').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    const prefix = this.type === 'income' ? 'IN' : 'OUT';
    const sequence = (count + 1).toString().padStart(4, '0');
    this.transactionNumber = `${prefix}${year}${month}${day}-${sequence}`;
  }
  next();
});

// Méthode statique pour créer une transaction depuis une commande
transactionSchema.statics.createFromOrder = async function(order) {
  if (order.transactionCreated) {
    return null;
  }
  
  const transaction = await this.create({
    type: 'income',
    category: 'sales',
    amount: order.finalAmount,
    description: `Vente commande ${order.orderNumber}`,
    relatedDocument: {
      model: 'Order',
      id: order._id
    },
    paymentMethod: order.payment.method,
    date: order.payment.paidAt || new Date(),
    account: order.payment.method === 'cash' ? 'main_cash' : 
             order.payment.method === 'momo' ? 'momo_account' : 'bank_account',
    performedBy: 'system'
  });
  
  order.transactionCreated = true;
  await order.save();
  
  return transaction;
};

// Méthode statique pour obtenir le solde d'un compte
transactionSchema.statics.getAccountBalance = async function(account, endDate) {
  const matchStage = {
    status: 'completed'
  };
  
  if (account) {
    matchStage.account = account;
  }
  
  if (endDate) {
    matchStage.date = { $lte: new Date(endDate) };
  }
  
  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpense: 1,
        balance: { $subtract: ['$totalIncome', '$totalExpense'] }
      }
    }
  ]);
  
  return result[0] || { totalIncome: 0, totalExpense: 0, balance: 0 };
};

// Méthode statique pour obtenir les statistiques par catégorie
transactionSchema.statics.getCategoryStatistics = async function(startDate, endDate, type) {
  const matchStage = {
    status: 'completed'
  };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }
  
  if (type) {
    matchStage.type = type;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$category'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        average: { $avg: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Méthode statique pour obtenir les statistiques mensuelles
transactionSchema.statics.getMonthlyStatistics = async function(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.month': 1, '_id.type': 1 }
    }
  ]);
};

// Méthode statique pour obtenir le dashboard financier
transactionSchema.statics.getDashboard = async function(startDate, endDate) {
  const matchStage = {
    status: 'completed'
  };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }
  
  const [summary, byCategory, byAccount] = await Promise.all([
    // Résumé général
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Par catégorie
    this.getCategoryStatistics(startDate, endDate),
    
    // Par compte
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            account: '$account',
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);
  
  return {
    summary,
    byCategory,
    byAccount
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);