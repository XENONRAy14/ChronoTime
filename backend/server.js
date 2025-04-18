const express = require('express');
const cors = require('cors');
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
const PORT = 9000; // Port fixé à 9000 qui fonctionne correctement

// Importer notre middleware CORS robuste et spécialisé
const corsHandler = require('./middleware/cors-handler');

// Appliquer notre middleware CORS personnalisé en PRIORITÉ
app.use(corsHandler);

// Conserver la configuration cors standard comme couche supplémentaire
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 
                   'Cache-Control', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400
}));

// Support spécifique pour les requêtes OPTIONS (preflight)
app.options('*', corsHandler);

// Parser JSON
app.use(express.json());

// Connexion à MongoDB
const MONGO_URI = process.env.MONGO_URI || config.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Utiliser les routes
app.use('/api/courses', coursesRoutes);
app.use('/api/chronos', chronosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({ message: 'API ChronoMontagne fonctionne correctement!' });
});

// Endpoint de diagnostic pour vérifier l'authentification et les connexions
app.get('/api/diagnostic', async (req, res) => {
  try {
    // Vérifier la connexion à MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connectée' : 'déconnectée';
    
    // Compter le nombre d'utilisateurs dans la base de données
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    // Vérifier les variables d'environnement (sans exposer les valeurs sensibles)
    const envVars = {
      MONGO_URI: process.env.MONGO_URI ? 'configuré' : 'non configuré',
      NODE_ENV: process.env.NODE_ENV || 'non configuré'
    };
    
    // Informations sur le serveur
    const serverInfo = {
      uptime: Math.floor(process.uptime()) + ' secondes',
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    };
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        userCount
      },
      environment: envVars,
      server: serverInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
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
