require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middlewares/error');
const productRoutes = require('./routes/product.route');
const authRoutes = require('./routes/auth.route');
const packRoutes = require('./routes/pack.route');
const orderRoutes = require('./routes/order.route');
const sourcingRoutes = require('./routes/sourcing.route');
const transactionRoutes = require('./routes/transaction.route');

// Initialiser l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet());
app.use(mongoSanitize());

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression des réponses
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Route de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Valentine E-commerce est opérationnelle',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes API
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/products`, productRoutes);
app.use(`/api/${API_VERSION}/packs`, packRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/sourcing`, sourcingRoutes);
app.use(`/api/${API_VERSION}/transactions`, transactionRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Valentine E-commerce',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/docs`
  });
});

// Gestion des routes non trouvées
app.use(notFound);

// Gestion des erreurs
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  logger.error(`Erreur non gérée: ${err.message}`);
  // Fermer le serveur proprement
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error(`Exception non capturée: ${err.message}`);
  process.exit(1);
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Serveur écoute sur le port ${PORT}`);
  logger.info(`📍 API disponible sur http://localhost:${PORT}/api/${API_VERSION}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur...');
  server.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app;