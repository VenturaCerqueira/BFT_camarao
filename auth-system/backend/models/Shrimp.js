const mongoose = require('mongoose');

const shrimpSchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  shrimpType: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  daysOfLife: {
    type: Number,
    required: true,
    min: 1
  },
  evaluationDate: {
    type: Date,
    required: true
  },
  biometria: {
    type: Number,
    min: 0
  },
  sobrevivencia: {
    type: Number,
    min: 0,
    max: 100
  },
  fcr: {
    type: Number,
    min: 0
  },
  densidadeEstocagem: {
    type: Number,
    min: 0
  },
  sanidade: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Ativo', 'Finalizado', 'Cancelado'],
    default: 'Ativo'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
shrimpSchema.index({ createdBy: 1, tankId: 1 });
shrimpSchema.index({ startDate: -1 });

module.exports = mongoose.model('Shrimp', shrimpSchema);
