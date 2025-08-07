// Configuration sécurisée pour ChronoTime
// IMPORTANT: Les vraies valeurs doivent être dans le fichier .env

require('dotenv').config();

module.exports = {
  // MongoDB Atlas URI - DOIT être défini dans .env
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/chronomontagne',
  
  // URI de fallback pour base locale
  FALLBACK_MONGO_URI: process.env.FALLBACK_MONGO_URI || 'mongodb://localhost:27017/chronomontagne_local',
  
  // JWT Secret pour l'authentification
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
  
  // Port du serveur
  PORT: process.env.PORT || 3000,
  
  // Mode de développement
  NODE_ENV: process.env.NODE_ENV || 'development'
};
