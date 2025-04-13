const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret pour JWT (à mettre dans les variables d'environnement en production)
const JWT_SECRET = 'chronomontagne_secret_key';

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    // Vérifier le token dans l'en-tête Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Trouver l'utilisateur par ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = auth;
