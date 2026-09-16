const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
mongoose.set('bufferCommands', false);
app.disable('x-powered-by');
app.use(require('./middleware/cors-handler'));
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
  next();
});
app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable', mongodb: ready ? 'connected' : 'disconnected' });
});
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Base de données indisponible. Réessayez dans quelques instants.' });
  next();
});
for (const name of ['courses', 'chronos', 'auth', 'admin']) app.use('/api/' + name, require('./routes/' + name));
app.use('/api', (req, res) => res.status(404).json({ message: 'Route API introuvable' }));
const publicDir = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(publicDir));
app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.use((err, req, res, next) => {
  const status = err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ message: status === 413 ? 'Requête trop volumineuse' : status === 400 ? 'JSON invalide' : 'Erreur serveur' });
});
if (require.main === module) {
  mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 5000 }).catch(() => console.error('Connexion MongoDB indisponible. Vérifiez MONGO_URI.'));
  app.listen(config.PORT, () => console.log('ChronoTime : http://localhost:' + config.PORT));
}
module.exports = app;
