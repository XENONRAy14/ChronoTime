const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const server = http.createServer((req, res) => {
  // Construire le chemin du fichier à partir de l'URL
  let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Obtenir l'extension du fichier
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Types MIME pour les fichiers courants
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  // Définir le type de contenu
  const contentType = contentTypes[extname] || 'application/octet-stream';

  // Lire le fichier
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Page non trouvée
        fs.readFile(path.join(FRONTEND_DIR, '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content || '404 Not Found', 'utf-8');
        });
      } else {
        // Erreur serveur
        res.writeHead(500);
        res.end(`Erreur serveur: ${error.code}`);
      }
    } else {
      // Succès
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Appuyez sur Ctrl+C pour arrêter le serveur`);
});
