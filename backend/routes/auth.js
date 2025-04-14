const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret pour JWT (à mettre dans les variables d'environnement en production)
const JWT_SECRET = 'chronomontagne_secret_key';

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' 
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password,
      name
    });
    
    // Sauvegarder l'utilisateur (le mot de passe sera haché automatiquement)
    await newUser.save();
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Retourner les informations de l'utilisateur et le token
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Trouver l'utilisateur par nom d'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Retourner les informations de l'utilisateur et le token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour obtenir les informations de l'utilisateur actuel
router.get('/user', async (req, res) => {
  try {
    // Vérifier le token dans l'en-tête Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Trouver l'utilisateur par ID
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

module.exports = router;
