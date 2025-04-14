const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chrono = require('../models/Chrono');
const adminAuth = require('../middleware/admin');

// Route UNIFIÉE de diagnostic pour l'administration - sans authentification requise
router.get('/debug', async (req, res) => {
  try {
    // Anti-cache pour assurer des données fraîches
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    // Récupérer tous les utilisateurs sans filtrage
    const rawUsers = await User.find().select('-password');
    const chronos = await Chrono.countDocuments();
    
    // Log détaillé pour débogage
    console.log('DONNÉES BRUTES DES UTILISATEURS:');
    rawUsers.forEach(user => {
      console.log(`Utilisateur ${user.username} - isAdmin = ${user.isAdmin} (${typeof user.isAdmin})`);
      console.log(`ID: ${user._id}, Date de création: ${user.createdAt}`);
    });
    
    // Normaliser le format pour l'interface
    const users = rawUsers.map(user => {
      // IMPORTANT: Vérification préalable si l'utilisateur est Belho.r pour forcer son statut admin
      if (user.username === 'Belho.r' || user.email === 'rayanbelho@hotmail.com') {
        console.log('CORRECTION ADMIN: Belho.r détecté avec isAdmin =', user.isAdmin);
        // Force la valeur à true explicitement avant de continuer
        user.isAdmin = true;
        // Sauvegarde la modification dans la base de données
        User.findByIdAndUpdate(user._id, { isAdmin: true }).then(() => {
          console.log('CORRECTION PERMANENTE: Base de données mise à jour pour Belho.r');
        }).catch(err => {
          console.error('Erreur lors de la mise à jour permanente:', err);
        });
      }
      
      // Extraire l'ID dans le bon format
      const userId = user._id ? user._id.toString() : null;
      
      // Log explicite pour débogage
      console.log(`Traitement de ${user.username} - isAdmin = ${Boolean(user.isAdmin)}`);
      
      return {
        id: userId,
        _id: userId,
        username: user.username || '',
        email: user.email || '',
        name: user.name || user.username || '',
        // Conversion explicite en booléen pour éviter tout problème
        isAdmin: Boolean(user.isAdmin),
        // Conserver les dates originales
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Ajouter des champs formatés pour l'affichage
        createdAtFormatted: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date inconnue'
      };
    });
    
    // Réponse complète
    res.json({
      status: 'ok',
      message: 'Diagnostic d\'administration unifié',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        admins: rawUsers.filter(u => u.isAdmin).length,
        chronos
      },
      users: users
    });
  } catch (error) {
    console.error('Erreur route diagnostic unifiée:', error);
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

// Route de débogage alternative - pour compatibilité avec d'anciennes versions
router.get('/debug-legacy', async (req, res) => {
  try {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const users = await User.find().select('-password');
    res.json({
      success: true,
      message: 'Cette route est dépréciée, utilisez /debug à la place',
      count: users.length,
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin
      }))
    });
  } catch (error) {
    console.error('Erreur route debug-legacy:', error);
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
