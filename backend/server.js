const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Importer les routes
const coursesRoutes = require('./routes/courses');
const chronosRoutes = require('./routes/chronos');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:password123@cluster0.mongodb.net/chronomontagne';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Utiliser les routes
app.use('/api/courses', coursesRoutes);
app.use('/api/chronos', chronosRoutes);

// Endpoint de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({ message: 'API ChronoMontagne fonctionne correctement!' });
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
