// Configuration MongoDB
module.exports = {
  // Utiliser une base de données MongoDB Atlas gratuite
  // Cette base de données est configurée pour accepter les connexions de n'importe quelle adresse IP
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/chronomontagne'
};
