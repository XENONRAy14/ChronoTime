const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chrono = require('../models/Chrono');
const adminAuth = require('../middleware/admin');

// Route de diagnostic pour l'administration
router.get('/debug', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const chronos = await Chrono.countDocuments();
    
    res.json({
      status: 'ok',
      message: 'Diagnostic d\'administration',
      adminMiddleware: {
        version: '1.0',
        status: 'actif'
      },
      counts: {
        users: users.length,
        admins: users.filter(u => u.isAdmin).length,
        chronos
      },
      users: users.map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin || false
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes de contournement spéciales pour accès admin sans problèmes CORS

// Route spéciale #1: Contournement simple avec clé secrète
router.get('/bypass-users/:secretKey', async (req, res) => {
  try {
    // Vérifier la clé secrète (simple protection)
    const secretKey = req.params.secretKey;
    if (secretKey !== 'chrono2025') {
      return res.status(403).json({ message: 'Clé invalide' });
    }
    
    // Anti-cache uniquement (CORS géré par le middleware global)
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const users = await User.find().select('-password');
    res.json({
      success: true,
      timestamp: new Date().getTime(),
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware OPTIONS déjà géré au niveau global - suppression du code redondant

// Route directe simpliùe pour récupérer les utilisateurs (CORS géré globalement)
router.get('/direct-users', async (req, res) => {
  try {
    // Anti-cache uniquement
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const users = await User.find().select('-password');
    res.json({
      success: true,
      timestamp: new Date().getTime(),
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route JSONP pour récupérer les utilisateurs (contourne les restrictions CORS)
router.get('/users-jsonp', async (req, res) => {
  try {
    const callbackName = req.query.callback || 'callback';
    const users = await User.find().select('-password');
    
    // Renvoyer en format JSONP
    res.type('application/javascript');
    res.send(`${callbackName}(${JSON.stringify({
      success: true,
      timestamp: new Date().getTime(),
      count: users.length,
      users: users
    })})`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route sans auth pour débogage - récupérer TOUS les utilisateurs sans exception
router.get('/debug', async (req, res) => {
  try {
    // Anti-cache uniquement
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    // Récupérer tous les utilisateurs sans filtrage
    const rawUsers = await User.find().select('-password');
    
    // Log complet des utilisateurs bruts pour débogage
    console.log('Données brutes des utilisateurs:', JSON.stringify(rawUsers));
    
    // Normaliser le format pour qu'il soit exactement comme attendu par l'interface
    const users = rawUsers.map(user => {
      // Vérifier la valeur exacte du champ isAdmin pour débogage
      console.log(`Utilisateur ${user.username || user.email}: isAdmin = ${user.isAdmin}, type: ${typeof user.isAdmin}`);
      
      // Extraire et convertir l'ID de MongoDB pour qu'il soit compatible
      const userId = user._id ? user._id.toString() : null;
      console.log(`ID brut de l'utilisateur ${user.username}: ${userId}`);
      
      return {
        id: userId, // Format attendu par l'interface pour les actions
        _id: userId, // Format alternatif au cas où
        username: user.username || '',
        email: user.email || '',
        name: user.name || user.username || '',
        // S'assurer que isAdmin est correctement interprété comme booléen
        isAdmin: user.isAdmin === true || user.isAdmin === 'true' || user.isAdmin === 1,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
        // Ajouter d'autres champs potentiellement utiles
        role: user.isAdmin === true ? 'admin' : 'user'
      };
    });
    
    // Log du résultat de la normalisation
    console.log('Utilisateurs normalisés:', JSON.stringify(users));
    
    console.log(`Débogage admin: Envoi de ${users.length} utilisateurs formatés pour l'interface`);
    
    res.json({
      success: true,
      timestamp: new Date().getTime(),
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Erreur route debug:', error);
    res.status(500).json({ message: error.message });
  }
});

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
