const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const JWT_SECRET = config.JWT_SECRET;

// Middleware pour vérifier si l'utilisateur est administrateur
const adminAuth = async (req, res, next) => {
  try {
    // Extraire le token de l'en-tête Authorization
    let token = null;
    const authHeader = req.headers.authorization || req.header('Authorization');
    
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }
    
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
    
    // Vérifier si l'utilisateur est administrateur
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = adminAuth;
