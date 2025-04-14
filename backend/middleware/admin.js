const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret pour JWT (à mettre dans les variables d'environnement en production)
const JWT_SECRET = 'chronomontagne_secret_key';

// Middleware pour vérifier si l'utilisateur est administrateur
const adminAuth = async (req, res, next) => {
  try {
    console.log('Requête admin reçue:', req.method, req.originalUrl);
    
    // Politique plus souple pour l'en-tête Authorization
    let token = null;
    const authHeader = req.headers.authorization || req.header('Authorization');
    
    if (authHeader) {
      // Si l'en-tête commence par 'Bearer ', extraire le token
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // longueur de 'Bearer '
      } else {
        // Sinon prendre la valeur complète 
        token = authHeader;
      }
    }
    
    console.log('Token extrait:', token ? 'présent' : 'absent');
    
    // Vérifier si le token est présent
    if (!token) {
      // Pour Belho.r, on va autoriser l'accès temporairement
      // Vérifier si l'utilisateur est identifié d'une autre manière
      const username = req.query.username;
      if (username === 'Belho.r') {
        console.log('Accès spécial accordé à Belho.r');
        const specialUser = await User.findOne({ username: 'Belho.r' });
        if (specialUser) {
          req.user = specialUser;
          return next();
        }
      }
      
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
    
    // Special access for Belho.r to simplify testing
    if (user.username === 'Belho.r') {
      // Ensure Belho.r always has admin rights
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
        console.log('Droits admin accordés automatiquement à Belho.r');
      }
    }
    
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
