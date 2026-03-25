// Script pour définir un utilisateur comme administrateur
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');

// Modèle d'utilisateur (copie simplifiée pour éviter les problèmes d'importation)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

// Fonction pour définir un utilisateur comme administrateur
async function setUserAsAdmin(username) {
  try {
    // Connexion à MongoDB
    const MONGO_URI = process.env.MONGO_URI || config.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log('Connexion à MongoDB établie');
    
    // Rechercher l'utilisateur par nom d'utilisateur
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`Utilisateur "${username}" non trouvé.`);
      process.exit(1);
    }
    
    // Mettre à jour l'utilisateur pour le définir comme administrateur
    user.isAdmin = true;
    await user.save();
    
    console.log(`L'utilisateur "${username}" est maintenant administrateur.`);
    console.log('Détails de l\'utilisateur:', {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    });
    
    // Fermer la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
    
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

// Vérifier si un nom d'utilisateur a été fourni
const username = process.argv[2];
if (!username) {
  console.error('Veuillez fournir un nom d\'utilisateur.');
  console.error('Usage: node set-admin.js <username>');
  process.exit(1);
}

// Exécuter la fonction
setUserAsAdmin(username);
