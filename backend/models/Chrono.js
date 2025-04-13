const mongoose = require('mongoose');

// Schéma pour les statistiques de performance
const statsSchema = new mongoose.Schema({
  vitesseMax: {
    type: Number,  // en km/h
    default: 0
  },
  vitesseMoyenne: {
    type: Number,  // en km/h
    default: 0
  },
  denivelePositif: {
    type: Number,  // en mètres
    default: 0
  },
  deniveleNegatif: {
    type: Number,  // en mètres
    default: 0
  },
  altitudeMax: {
    type: Number,  // en mètres
    default: 0
  },
  altitudeMin: {
    type: Number,  // en mètres
    default: 0
  },
  frequenceCardiaqueMoyenne: {
    type: Number,  // en bpm
    default: 0
  },
  frequenceCardiaqueMax: {
    type: Number,  // en bpm
    default: 0
  }
});

// Schéma pour les chronos
const chronoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  utilisateur: { 
    type: String, 
    required: true,
    trim: true
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  temps: { 
    type: String, 
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now
  },
  stats: {
    type: statsSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chrono', chronoSchema);
