const express = require('express');
const router = express.Router();
const Chrono = require('../models/Chrono');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const validate = require('../validation');
for (const param of ['id', 'courseId']) router.param(param, (req, res, next, id) => validate.objectId(id) ? next() : res.status(400).json({ message: 'Identifiant invalide' }));

// GET tous les chronos - accessible sans authentification
router.get('/', async (req, res) => {
  try {
    // Anti-cache pour assurer des données fraîches
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const chronos = await Chrono.find().populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour une course spécifique - accessible sans authentification
router.get('/course/:courseId', async (req, res) => {
  try {
    // Anti-cache pour assurer des données fraîches
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const chronos = await Chrono.find({ courseId: req.params.courseId }).populate('courseId').sort({ createdAt: -1 });
    chronos.sort((a, b) => a.temps.split(':').reduce((t,n)=>t*60+Number(n),0) - b.temps.split(':').reduce((t,n)=>t*60+Number(n),0));
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour un utilisateur spécifique - accessible sans authentification
router.get('/utilisateur/:utilisateur', async (req, res) => {
  try {
    // Anti-cache pour assurer des données fraîches
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    
    const chronos = await Chrono.find({ utilisateur: req.params.utilisateur }).populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos de l'utilisateur connecté
router.get('/mes-chronos', auth, async (req, res) => {
  try {
    const chronos = await Chrono.find({ userId: req.user._id }).populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST un nouveau chrono
router.post('/', auth, async (req, res) => {
  if (!validate.objectId(req.body.courseId) || typeof req.body.temps !== 'string' || !/^\d{1,3}:[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/.test(req.body.temps) || req.body.temps.split(':').reduce((a, n) => a * 60 + Number(n), 0) <= 0) return res.status(400).json({ message: 'Parcours ou durée invalide' });
  try { if (!await Course.exists({ _id: req.body.courseId })) return res.status(404).json({ message: 'Parcours introuvable' }); } catch { return res.status(503).json({ message: 'Vérification du parcours impossible' }); }
  const requestId = req.body.clientRequestId;
  if (requestId != null && (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(requestId))) return res.status(400).json({ message: 'Identifiant de session invalide' });
  if (requestId) { try { const existing = await Chrono.findOne({ userId: req.user._id, clientRequestId: requestId }).populate('courseId'); if (existing) return res.json(existing); } catch { return res.status(503).json({ message: 'Vérification de session impossible' }); } }
  const stats = req.body.stats || {};
  for (const value of Object.values(stats)) if (!Number.isFinite(value) || value < 0 || value > 100000) return res.status(400).json({ message: 'Statistiques invalides' });
  const chrono = new Chrono({
    ...(requestId ? { clientRequestId: requestId } : {}),
    userId: req.user._id,
    utilisateur: req.user.username,
    courseId: req.body.courseId,
    temps: req.body.temps,
    date: new Date(),
    stats: req.body.stats || {}
  });

  try {
    const nouveauChrono = await chrono.save();
    const chronoPopulate = await Chrono.findById(nouveauChrono._id).populate('courseId');
    res.status(201).json(chronoPopulate);
  } catch (err) {
    if (err.code === 11000 && requestId) { try { const existing = await Chrono.findOne({ userId: req.user._id, clientRequestId: requestId }).populate('courseId'); if (existing) return res.json(existing); } catch {} }
    res.status(400).json({ message: 'Enregistrement impossible. Réessayez.' });
  }
});

// DELETE supprimer un chrono
router.delete('/:id', auth, async (req, res) => {
  try {
    const chrono = await Chrono.findById(req.params.id);
    if (!chrono) {
      return res.status(404).json({ message: 'Chrono non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire du chrono
    if (chrono.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas l\'autorisation de supprimer ce chrono' });
    }

    await chrono.deleteOne();
    res.json({ message: 'Chrono supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
