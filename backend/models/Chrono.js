const mongoose = require('mongoose');

// Schéma pour les chronos
const chronoSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chrono', chronoSchema);
