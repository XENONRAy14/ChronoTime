// Middleware spécialisé pour gérer les problèmes CORS de façon robuste
const corsHandler = (req, res, next) => {
  // 1. Autoriser TOUTES les origines - solution radicale mais efficace
  res.header('Access-Control-Allow-Origin', '*');
  
  // 2. Autoriser TOUTES les méthodes HTTP
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  // 3. Autoriser TOUS les en-têtes possibles
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, ' +
    'Cache-Control, Pragma, Expires, X-Api-Key, X-Total-Count');
  
  // 4. Autoriser les credentials (cookies, auth headers)
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 5. Définir le temps pendant lequel les résultats de requête OPTIONS peuvent être mis en cache
  res.header('Access-Control-Max-Age', '86400'); // 24 heures
  
  // 6. Exposer tous les en-têtes aux clients
  res.header('Access-Control-Expose-Headers', 
    'Content-Length, Content-Type, Authorization, X-Total-Count');
  
  // 7. Traitement spécial des requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    // Répondre immédiatement avec un statut 200 sans aller plus loin
    return res.status(200).end();
  }
  
  // Continuer vers le prochain middleware/contrôleur
  next();
};

module.exports = corsHandler;
