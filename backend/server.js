const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
require('dotenv').config();

// Importer les routes
const coursesRoutes = require('./routes/courses');
const chronosRoutes = require('./routes/chronos');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 9000; // Port configurable via .env

// Middleware CORS
const corsHandler = require('./middleware/cors-handler');
app.use(corsHandler);
app.options('*', corsHandler);

// Parser JSON
app.use(express.json());

// Connexion à MongoDB avec fallback intelligent
const MONGO_URI = process.env.MONGO_URI || config.MONGO_URI;
let isMongoConnected = false;
let useOfflineMode = false;

// Tentative de connexion à MongoDB Atlas
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout rapide
  socketTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ Connexion à MongoDB Atlas établie');
    isMongoConnected = true;
  })
  .catch(async (err) => {
    console.error('❌ Erreur de connexion à MongoDB Atlas:', err.message);
    console.log('🔄 Tentative de connexion à la base locale...');
    
    // Essayer la base locale si disponible
    try {
      await mongoose.connect(config.FALLBACK_MONGO_URI, {
        serverSelectionTimeoutMS: 2000
      });
      console.log('✅ Connexion à MongoDB local établie');
      isMongoConnected = true;
    } catch (localErr) {
      console.error('❌ Base locale indisponible:', localErr.message);
      console.log('🚀 Activation du mode hors-ligne avec données par défaut');
      useOfflineMode = true;
      isMongoConnected = false;
    }
  });

// Middleware pour injecter le statut de connexion
app.use((req, res, next) => {
  req.isMongoConnected = isMongoConnected;
  req.useOfflineMode = useOfflineMode;
  next();
});

// Utiliser les routes
app.use('/api/courses', coursesRoutes);
app.use('/api/chronos', chronosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Servir les fichiers statiques (en production et en développement)
app.use(express.static(path.join(__dirname, '../frontend')));

// Pour toutes les routes non-API, renvoyer index.html
app.get('*', (req, res) => {
  // Ne pas interférer avec les routes API
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
