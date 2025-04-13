const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chrono = require('../models/Chrono');
const adminAuth = require('../middleware/admin');

// Route pour obtenir tous les utilisateurs (admin uniquement)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour supprimer un utilisateur (admin uniquement)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer les chronos de l'utilisateur
    await Chrono.deleteMany({ userId: userId });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Utilisateur et ses données supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour promouvoir un utilisateur en administrateur (admin uniquement)
router.patch('/users/:id/promote', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Promouvoir l'utilisateur en administrateur
    user.isAdmin = true;
    await user.save();
    
    res.json({ message: 'Utilisateur promu administrateur avec succès', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour rétrograder un administrateur (admin uniquement)
router.patch('/users/:id/demote', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier qu'on ne rétrograde pas le dernier admin
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1 && user.isAdmin) {
      return res.status(400).json({ message: 'Impossible de rétrograder le dernier administrateur' });
    }
    
    // Rétrograder l'administrateur
    user.isAdmin = false;
    await user.save();
    
    res.json({ message: 'Administrateur rétrogradé avec succès', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour obtenir des statistiques sur les utilisateurs (admin uniquement)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    res.json({
      totalUsers,
      totalAdmins,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
