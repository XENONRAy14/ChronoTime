const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
module.exports = (req, res, next) => {
  const origin = req.headers.origin;
  const sameOrigin = origin && origin === `${req.protocol}://${req.get('host')}`;
  if (origin && !sameOrigin && !origins.includes(origin)) return res.status(403).json({ message: 'Origine non autorisée' });
  res.vary('Origin');
  if (origin) res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};
