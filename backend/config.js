const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const crypto = require('crypto');
const secret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32 || /change_me|your_jwt/.test(secret))) {
  throw new Error('JWT_SECRET doit contenir au moins 32 caractères aléatoires en production.');
}
if (!secret) console.warn('JWT_SECRET absent : clé temporaire de développement, sessions invalidées au redémarrage.');
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chronotime',
  JWT_SECRET: secret || crypto.randomBytes(48).toString('hex'),
  PORT: process.env.PORT || 9000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
