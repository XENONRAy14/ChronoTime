const express = require('express');
const router = express.Router();
const Chrono = require('../models/Chrono');

// GET tous les chronos
router.get('/', async (req, res) => {
  try {
    const chronos = await Chrono.find().populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour une course spécifique
router.get('/course/:courseId', async (req, res) => {
  try {
    const chronos = await Chrono.find({ courseId: req.params.courseId }).populate('courseId').sort({ temps: 1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET les chronos pour un utilisateur spécifique
router.get('/utilisateur/:utilisateur', async (req, res) => {
  try {
    const chronos = await Chrono.find({ utilisateur: req.params.utilisateur }).populate('courseId').sort({ createdAt: -1 });
    res.json(chronos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST un nouveau chrono
router.post('/', async (req, res) => {
  const chrono = new Chrono({
    utilisateur: req.body.utilisateur,
    courseId: req.body.courseId,
    temps: req.body.temps,
    date: req.body.date ? new Date(req.body.date) : new Date()
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
router.delete('/:id', async (req, res) => {
  try {
    const chrono = await Chrono.findById(req.params.id);
    if (!chrono) {
      return res.status(404).json({ message: 'Chrono non trouvé' });
    }

    await chrono.deleteOne();
    res.json({ message: 'Chrono supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
