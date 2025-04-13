const express = require('express');
const router = express.Router();
const Chrono = require('../models/Chrono');
const auth = require('../middleware/auth');

// GET tous les chronos
router.get('/', auth, async (req, res) => {
  try {
    const chronos = await Chrono.find().populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour une course spécifique
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const chronos = await Chrono.find({ courseId: req.params.courseId }).populate('courseId').sort({ temps: 1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour un utilisateur spécifique
router.get('/utilisateur/:utilisateur', auth, async (req, res) => {
  try {
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
  const chrono = new Chrono({
    userId: req.user._id,
    utilisateur: req.user.name,
    courseId: req.body.courseId,
    temps: req.body.temps,
    date: req.body.date ? new Date(req.body.date) : new Date(),
    stats: req.body.stats || {}
  });

  try {
    const nouveauChrono = await chrono.save();
    const chronoPopulate = await Chrono.findById(nouveauChrono._id).populate('courseId');
    res.status(201).json(chronoPopulate);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
