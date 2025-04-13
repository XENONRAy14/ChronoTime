// Script pour créer un utilisateur de test
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chronomontagne')
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Créer un utilisateur de test
async function createTestUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username: 'testuser2025' });
    if (existingUser) {
      console.log('L\'utilisateur de test existe déjà');
      mongoose.disconnect();
      return;
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);

    // Créer l'utilisateur
    const newUser = new User({
      username: 'testuser2025',
      name: 'Utilisateur Test 2025',
      password: hashedPassword
    });

    // Sauvegarder l'utilisateur
    await newUser.save();
    console.log('Utilisateur de test créé avec succès');
    
    // Déconnecter de MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur de test:', error);
    mongoose.disconnect();
  }
}

// Exécuter la fonction
createTestUser();
