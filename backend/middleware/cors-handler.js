// Liste blanche des origines autorisées
const ALLOWED_ORIGINS = [
  'https://chronotime.netlify.app',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:9000',
  'http://127.0.0.1:8080'
];

const corsHandler = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Autoriser l'origine si elle est dans la liste blanche
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // Requêtes sans origin (ex: Postman, curl, serveur) : autoriser sans credentials
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 
    'Content-Length, Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

module.exports = corsHandler;
