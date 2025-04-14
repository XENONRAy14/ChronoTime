const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret pour JWT (à mettre dans les variables d'environnement en production)
const JWT_SECRET = 'chronomontagne_secret_key';

// Middleware pour vérifier si l'utilisateur est administrateur
const adminAuth = async (req, res, next) => {
  try {
    console.log('Requête admin reçue:', req.method, req.originalUrl);
    console.log('En-têtes:', JSON.stringify(req.headers));
    
    // Vérifier le token dans l'en-tête Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('Erreur: Token manquant');
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé:', { id: decoded.id });
    
    // Trouver l'utilisateur par ID
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Erreur: Utilisateur non trouvé pour ID:', decoded.id);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    console.log('Utilisateur trouvé:', { 
      id: user._id, 
      username: user.username,
      isAdmin: user.isAdmin || false 
    });
    
    // Vérifier si l'utilisateur est administrateur
    if (!user.isAdmin) {
      console.log('Erreur: Utilisateur non administrateur');
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }
    
    console.log('Accès administrateur accordé à:', user.username);
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification admin:', error.message);
    res.status(401).json({ message: 'Token invalide', error: error.message });
  }
};

module.exports = adminAuth;
