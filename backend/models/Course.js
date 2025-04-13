const mongoose = require('mongoose');

// Schéma pour les points du tracé
const pointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

// Schéma pour les courses
const courseSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true,
    trim: true
  },
  distance: { 
    type: Number, 
    required: true,
    min: 0
  },
  denivele: { 
    type: Number, 
    required: true,
    min: 0
  },
  tracePath: {
    type: [pointSchema],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
