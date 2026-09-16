const router = require('express').Router();
const Course = require('../models/Course');
const Chrono = require('../models/Chrono');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../validation');
router.param('id', (req, res, next, id) => validate.objectId(id) ? next() : res.status(400).json({ message: 'Identifiant invalide' }));
router.get('/', async (req, res) => {
  try { res.json(await Course.find().sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: 'Impossible de charger les parcours' }); }
});
router.get('/:id', async (req, res) => {
  try { const course = await Course.findById(req.params.id); course ? res.json(course) : res.status(404).json({ message: 'Parcours introuvable' }); }
  catch { res.status(500).json({ message: 'Impossible de charger le parcours' }); }
});
router.post('/', auth, async (req, res) => {
  const error = validate.course(req.body);
  if (error) return res.status(400).json({ message: error });
  try { const { nom, distance, denivele, tracePath } = req.body; res.status(201).json(await Course.create({ nom: nom.trim(), distance, denivele, tracePath })); }
  catch { res.status(400).json({ message: 'Impossible de créer le parcours' }); }
});
router.put('/:id', admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Parcours introuvable' });
    if (await Chrono.exists({ courseId: req.params.id })) return res.status(409).json({ message: 'Ce parcours contient des chronos. Créez un nouveau parcours pour modifier le tracé.' });
    const data = { ...course.toObject(), ...req.body };
    const error = validate.course(data);
    if (error) return res.status(400).json({ message: error });
    for (const key of ['nom', 'distance', 'denivele', 'tracePath']) course[key] = data[key];
    res.json(await course.save());
  } catch { res.status(400).json({ message: 'Modification impossible' }); }
});
router.delete('/:id', admin, async (req, res) => {
  try {
    if (await Chrono.exists({ courseId: req.params.id })) return res.status(409).json({ message: 'Ce parcours contient des chronos. Sa suppression est bloquée.' });
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Parcours introuvable' });
    res.json({ message: 'Parcours supprimé' });
  } catch { res.status(400).json({ message: 'Suppression impossible' }); }
});
module.exports = router;
