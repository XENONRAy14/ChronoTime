const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Chrono = require('../models/Chrono');
const adminAuth = require('../middleware/admin');

// Route UNIFIÉE de diagnostic pour l'administration - sans authentification requise
router.get('/debug', async (req, res) => {
  try {
    // Anti-cache pour assurer des données fraîches
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    // Vérification de la disponibilité de la base de données
    if (!mongoose.connection.readyState) {
      console.error('Base de données non connectée!');
      return res.status(500).json({
        status: 'error',
        message: 'La connexion à la base de données n\'est pas disponible'
      });
    }
    
    // Récupérer tous les utilisateurs avec TOUTES leurs informations (sauf mot de passe)
    console.log('Début de la récupération des utilisateurs depuis MongoDB...');
    const rawUsers = await User.find().select('-password');
    const chronos = await Chrono.countDocuments();
    
    // Vérifier si la requête a réussi
    if (!rawUsers) {
      console.error('Aucun utilisateur récupéré de la base de données');
      return res.status(404).json({
        status: 'error',
        message: 'Aucun utilisateur trouvé dans la base de données'
      });
    }
    
    // Log détaillé des données brutes pour débogage
    console.log(`SUCCÈS: ${rawUsers.length} utilisateurs récupérés directement de MongoDB`);
    rawUsers.forEach(user => {
      console.log('----- Données brutes utilisateur -----');
      console.log(`ID: ${user._id} (${typeof user._id})`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.name || 'Non défini'}`);
      console.log(`isAdmin: ${user.isAdmin} (${typeof user.isAdmin})`);
      console.log(`Date de création: ${user.createdAt} (${typeof user.createdAt})`);
      console.log('-----------------------------------');
    });
    
    // CORRECTION PERMANENTE: Vérifier et mettre à jour Belho.r comme administrateur
    const adminUser = rawUsers.find(u => u.username === 'Belho.r' || u.email === 'rayanbelho@hotmail.com');
    if (adminUser && !adminUser.isAdmin) {
      console.log('CORRECTION ADMIN: Belho.r n\'est pas marqué comme administrateur dans la base de données');
      // Mis à jour synchrone pour garantir que la modification est appliquée immédiatement
      await User.findByIdAndUpdate(adminUser._id, { isAdmin: true });
      console.log('CORRECTION PERMANENTE: Base de données mise à jour pour Belho.r (isAdmin = true)');
      // Récupérer à nouveau l'utilisateur pour confirmer la mise à jour
      adminUser.isAdmin = true;
    }
    
    // CORRECTION DES DATES: Vérifier et mettre à jour les dates manquantes
    for (const user of rawUsers) {
      if (!user.createdAt) {
        console.log(`CORRECTION DATE: Date de création manquante pour ${user.username}`);
        // Attribuer une date par défaut et sauvegarder dans la base de données
        const defaultDate = new Date('2025-04-01T00:00:00Z');
        await User.findByIdAndUpdate(user._id, { createdAt: defaultDate });
        console.log(`CORRECTION PERMANENTE: Date de création définie pour ${user.username}`);
        // Mettre à jour l'objet local pour la réponse actuelle
        user.createdAt = defaultDate;
      }
    }
    
    // Normaliser le format pour l'interface (en préservant toutes les données d'origine)
    const users = rawUsers.map(user => {
      // Extraire l'ID dans le bon format
      const userId = user._id ? user._id.toString() : null;
      
      // Préparer un objet utilisateur complet avec TOUTES les données d'origine
      const userObject = {
        // Données d'identification
        id: userId,
        _id: userId,
        username: user.username || '',
        email: user.email || '',
        name: user.name || user.username || '',
        
        // Status administrateur (avec conversion explicite en booléen)
        isAdmin: Boolean(user.isAdmin),
        
        // Dates originales complètes
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        
        // Ajouter des champs formatés pour faciliter l'affichage
        createdAtFormatted: user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }) 
          : '01/04/2025' // Date par défaut au lieu de 'Date inconnue'
      };
      
      // Log final pour confirmer les données qui seront envoyées
      console.log(`Envoi de ${user.username} avec isAdmin = ${userObject.isAdmin} et date = ${userObject.createdAtFormatted}`);
      
      return userObject;
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

// Routes pour la gestion des utilisateurs

// Route pour promouvoir un utilisateur en admin
router.put('/users/:userId/promote', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Tentative de promotion de l'utilisateur avec ID: ${userId}`);
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `Utilisateur avec ID ${userId} non trouvé` 
      });
    }
    
    // Si déjà admin, renvoyer succès sans modification
    if (user.isAdmin) {
      return res.json({ 
        success: true, 
        message: `${user.username} est déjà administrateur`, 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: true
        }
      });
    }
    
    // Promouvoir l'utilisateur
    user.isAdmin = true;
    await user.save();
    
    console.log(`Utilisateur ${user.username} promu au rang d'administrateur`);
    
    // Renvoyer une réponse de succès
    res.json({
      success: true,
      message: `${user.username} a été promu administrateur`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erreur serveur: ${error.message}` 
    });
  }
});

// Route pour rétrograder un utilisateur
router.put('/users/:userId/demote', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Tentative de rétrogradation de l'utilisateur avec ID: ${userId}`);
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `Utilisateur avec ID ${userId} non trouvé` 
      });
    }
    
    // S'assurer qu'on ne rétrograde pas le super admin (Belho.r)
    if (user.username === 'Belho.r' || user.email === 'rayanbelho@hotmail.com') {
      return res.status(403).json({ 
        success: false, 
        message: 'Impossible de rétrograder le super administrateur' 
      });
    }
    
    // Si déjà non-admin, renvoyer succès sans modification
    if (!user.isAdmin) {
      return res.json({ 
        success: true, 
        message: `${user.username} n'est déjà pas administrateur`, 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: false
        }
      });
    }
    
    // Rétrograder l'utilisateur
    user.isAdmin = false;
    await user.save();
    
    console.log(`Utilisateur ${user.username} rétrogradé au rang de simple utilisateur`);
    
    // Renvoyer une réponse de succès
    res.json({
      success: true,
      message: `${user.username} a été rétrogradé`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error('Erreur lors de la rétrogradation:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erreur serveur: ${error.message}` 
    });
  }
});

// Route pour supprimer un utilisateur
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `Utilisateur avec ID ${userId} non trouvé` 
      });
    }
    
    // S'assurer qu'on ne supprime pas le super admin (Belho.r)
    if (user.username === 'Belho.r' || user.email === 'rayanbelho@hotmail.com') {
      return res.status(403).json({ 
        success: false, 
        message: 'Impossible de supprimer le super administrateur' 
      });
    }
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    
    console.log(`Utilisateur ${user.username} supprimé`);
    
    // Renvoyer une réponse de succès
    res.json({
      success: true,
      message: `Utilisateur ${user.username} supprimé`
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erreur serveur: ${error.message}` 
    });
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
