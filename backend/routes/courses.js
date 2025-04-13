const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET toutes les courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET une course spécifique
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course non trouvée' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST une nouvelle course
router.post('/', async (req, res) => {
  const course = new Course({
    nom: req.body.nom,
    distance: req.body.distance,
    denivele: req.body.denivele,
    tracePath: req.body.tracePath
  });

  try {
    const nouvelleCourse = await course.save();
    res.status(201).json(nouvelleCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour une course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course non trouvée' });
    }

    if (req.body.nom) course.nom = req.body.nom;
    if (req.body.distance) course.distance = req.body.distance;
    if (req.body.denivele) course.denivele = req.body.denivele;
    if (req.body.tracePath) course.tracePath = req.body.tracePath;

    const courseModifiee = await course.save();
    res.json(courseModifiee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer une course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course non trouvée' });
    }

    await course.deleteOne();
    res.json({ message: 'Course supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
