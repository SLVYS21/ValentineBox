# Valentine E-commerce Backend API v2.5

Backend API REST professionnel pour site e-commerce Saint-Valentin avec **authentification JWT**, **recherche intelligente par budget**, et **système de packs préfabriqués**, capable de gérer 5000+ visites/jour.

## 🆕 Nouveautés v2.5

- ✅ **Système de Packs Préfabriqués** avec prix promotionnels automatiques
- ✅ Recherche intelligente de packs par budget
- ✅ Gestion automatique du stock des packs
- ✅ 5 catégories de budget prédéfinies
- ✅ Personnalisation optionnelle des packs
- ✅ Statistiques et analytics avancées

## 🆕 Nouveautés v2.0

- ✅ **Système d'authentification JWT** complet avec rôles et permissions
- ✅ **Recherche intelligente par budget** avec algorithme d'upsell
- ✅ **Protection de toutes les routes admin**
- ✅ Gestion avancée des utilisateurs
- ✅ Suggestions de bundles automatiques

## 🚀 Quick Start

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos configurations

# Créer le premier super admin
npm run create-super-admin

# Démarrage en développement
npm run dev

# Démarrage en production
npm start
```

## 📋 Fonctionnalités

### Authentification 🔐
- ✅ Connexion JWT sécurisée
- ✅ 2 rôles : Super Admin & Admin
- ✅ 7 permissions granulaires
- ✅ Verrouillage après tentatives échouées
- ✅ Réinitialisation de mot de passe
- ✅ Gestion des utilisateurs

### Packs Préfabriqués 🎁 (v2.5)
- ✅ Bundles de produits avec prix promotionnels
- ✅ Réductions automatiques (15-30%)
- ✅ Recherche intelligente par budget
- ✅ 5 catégories de budget
- ✅ Gestion automatique du stock
- ✅ Personnalisation optionnelle
- ✅ Statistiques de vente

### Recherche Intelligente 💰
- ✅ Algorithme par budget avec 3 niveaux
- ✅ Suggestions d'upsell (+20% à +40%)
- ✅ Recommandations de bundles
- ✅ Messages personnalisés
- ✅ Métriques d'affordabilité

### Gestion des Produits 🎁
- ✅ CRUD complet avec images Cloudinary
- ✅ Gestion du stock en temps réel
- ✅ Historique des mouvements
- ✅ Alertes de stock faible
- ✅ Catégorisation et tags
- ✅ Recherche full-text

### Système de Commandes 🛒
- ✅ 8 statuts de suivi
- ✅ Réservation automatique du stock
- ✅ Multi-articles avec quantités
- ✅ Livraison et paiement configurables
- ✅ Historique complet

### Sourcing & Finances 📊
- ✅ Gestion des approvisionnements
- ✅ Suivi des fournisseurs
- ✅ Transactions automatiques et manuelles
- ✅ Dashboard financier complet
- ✅ 4 comptes (caisse, MoMo, banque, carte)

## 🛠️ Stack Technique

- **Node.js** + **Express.js** : Framework backend
- **MongoDB** + **Mongoose** : Base de données NoSQL
- **Cloudinary** : Stockage et optimisation d'images
- **Joi** : Validation des données
- **Winston** : Logging
- **Helmet** : Sécurité HTTP

## 📚 Documentation

Consultez [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour :
- Guide d'installation détaillé
- Documentation complète des endpoints
- Modèles de données
- Guide de déploiement
- Best practices de sécurité

## 🔗 Endpoints principaux

### Base URL
```
http://localhost:5000/api/v1
```

### Authentification 🆕
- `POST /auth/login` - Connexion
- `GET /auth/me` - Profil connecté
- `PUT /auth/change-password` - Changer mot de passe
- `POST /auth/register` - Créer admin (super admin)
- `GET /auth/users` - Liste utilisateurs (super admin)

### Packs (Bundles) 🆕 v2.5
- `GET /packs` - Liste des packs avec filtres
- `GET /packs/search/by-budget` - Recherche par budget
- `GET /packs/:id` - Détails d'un pack
- `POST /packs` - Créer un pack (admin) 🔒
- `PUT /packs/:id` - Modifier un pack (admin) 🔒
- `GET /packs/statistics` - Statistiques (admin) 🔒

### Recherche Intelligente 🆕
- `GET /products/search/by-budget` - Recherche par budget avec upsell

### Produits (Public)
- `GET /products` - Liste des produits
- `GET /products/:id` - Détails d'un produit

### Produits (Admin) 🔒
- `POST /products` - Créer un produit
- `PUT /products/:id` - Mettre à jour
- `POST /products/:id/images` - Upload image
- `POST /products/:id/stock/adjust` - Ajuster le stock
- `GET /products/stock/alerts` - Alertes de stock

### Commandes
- `POST /orders` - Créer une commande (public)
- `GET /orders` - Liste des commandes (admin) 🔒
- `PATCH /orders/:id/status` - Changer le statut (admin) 🔒
- `GET /orders/today` - Commandes du jour (admin) 🔒

### Sourcing (Admin) 🔒
- `GET /sourcing` - Liste des sourcings
- `POST /sourcing` - Créer un sourcing
- `PATCH /sourcing/:id/status` - Mettre à jour le statut

### Transactions (Admin) 🔒
- `GET /transactions` - Liste des transactions
- `POST /transactions` - Créer une transaction manuelle
- `GET /transactions/dashboard` - Dashboard financier
- `GET /transactions/balance/:account` - Solde d'un compte

🔒 = Nécessite authentification JWT

## 📝 Configuration requise

### Variables d'environnement (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/valentine-ecommerce

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

## 🏗️ Structure du projet

```
src/
├── config/           # Configurations (DB, Cloudinary, Logger)
├── controllers/      # Logique métier
├── middleware/       # Middleware (validation, erreurs, upload)
├── models/          # Modèles Mongoose
├── routes/          # Routes Express
└── server.js        # Point d'entrée
```

## 🔒 Sécurité

- **Helmet** : Protection contre vulnérabilités web
- **Rate Limiting** : 100 requêtes / 15 minutes par IP
- **Mongo Sanitize** : Protection contre injections NoSQL
- **CORS** : Origines autorisées uniquement
- **Validation Joi** : Toutes les entrées validées

## 📊 Performance

- **Indexation MongoDB** : Requêtes optimisées
- **Compression gzip** : Réponses compressées
- **Pagination** : Toutes les listes paginées
- **Pool de connexions** : 10 connexions MongoDB max

## 🚢 Déploiement

### Production Checklist
- [ ] `NODE_ENV=production`
- [ ] MongoDB Atlas avec réplica set
- [ ] Variables d'environnement sécurisées
- [ ] SSL/HTTPS activé
- [ ] Monitoring configuré (PM2)
- [ ] Backup automatique activé

### Déploiement avec PM2
```bash
npm install -g pm2
pm2 start src/server.js --name valentine-api
pm2 startup
pm2 save
```

## 📈 Monitoring

```bash
# Logs en temps réel
pm2 logs valentine-api

# Monitoring
pm2 monit

# Redémarrage
pm2 restart valentine-api
```

## 🤝 Support

Pour toute question ou problème, consultez la [documentation complète](./API_DOCUMENTATION.md).

## 📄 License

Copyright © 2025. Tous droits réservés.