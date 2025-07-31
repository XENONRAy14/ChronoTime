const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Types MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let pathname = url.parse(req.url).pathname;
  
  // Rediriger / vers /index.html (version normale)
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial; background: #1a1a1a; color: white; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">404 - Fichier non trouvé</h1>
              <p>Le fichier <code>${pathname}</code> n'existe pas.</p>
              <p><a href="/index-debug.html" style="color: #00ccff;">Aller à la version debug</a></p>
              <p><a href="/index.html" style="color: #00ccff;">Aller à la version complète</a></p>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end('Erreur serveur: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur de développement démarré sur http://localhost:${PORT}`);
  console.log(`📱 Version debug: http://localhost:${PORT}/index-debug.html`);
  console.log(`🎨 Version complète: http://localhost:${PORT}/index.html`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
