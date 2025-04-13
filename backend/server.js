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

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
