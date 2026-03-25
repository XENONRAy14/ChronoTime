const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Chrono = require('../models/Chrono');
const adminAuth = require('../middleware/admin');

// Route de diagnostic admin (protégée par authentification)
router.get('/debug', adminAuth, async (req, res) => {
  try {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    if (!mongoose.connection.readyState) {
      return res.status(500).json({
        status: 'error',
        message: 'La connexion à la base de données n\'est pas disponible'
      });
    }
    
    const rawUsers = await User.find().select('-password');
    const chronos = await Chrono.countDocuments();
    
    const users = rawUsers.map(user => ({
      id: user._id ? user._id.toString() : null,
      _id: user._id ? user._id.toString() : null,
      username: user.username || '',
      email: user.email || '',
      name: user.name || user.username || '',
      isAdmin: Boolean(user.isAdmin),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdAtFormatted: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
          }) 
        : 'Date inconnue'
    }));
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        admins: rawUsers.filter(u => u.isAdmin).length,
        chronos
      },
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tous les utilisateurs (admin uniquement)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE supprimer un utilisateur et ses chronos (admin uniquement)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer les chronos de l'utilisateur
    await Chrono.deleteMany({ userId: userId });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: `Utilisateur ${user.username} et ses données supprimés avec succès` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH promouvoir un utilisateur en administrateur (admin uniquement)
router.patch('/users/:id/promote', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    if (user.isAdmin) {
      return res.json({ success: true, message: `${user.username} est déjà administrateur` });
    }
    
    user.isAdmin = true;
    await user.save();
    
    res.json({ success: true, message: `${user.username} a été promu administrateur`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH rétrograder un administrateur (admin uniquement)
router.patch('/users/:id/demote', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier qu'on ne rétrograde pas le dernier admin
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1 && user.isAdmin) {
      return res.status(400).json({ success: false, message: 'Impossible de rétrograder le dernier administrateur' });
    }
    
    if (!user.isAdmin) {
      return res.json({ success: true, message: `${user.username} n'est déjà pas administrateur` });
    }
    
    user.isAdmin = false;
    await user.save();
    
    res.json({ success: true, message: `${user.username} a été rétrogradé`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET statistiques publiques (nombres uniquement, pas de données sensibles)
router.get('/stats', async (req, res) => {
  try {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    res.json({
      totalUsers,
      totalAdmins,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
