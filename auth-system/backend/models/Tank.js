const mongoose = require('mongoose');

const tankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: Number,
    required: true,
    min: 0.1
  },
  installationDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  feedingType: {
    type: String,
    required: true,
    enum: ['Natural', 'Artificial', 'Mista'],
    trim: true
  },
  technicalResponsible: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Ativo', 'Inativo', 'Manutenção'],
    default: 'Ativo'
  },
  notes: {
    type: String,
    trim: true
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
tankSchema.index({ createdBy: 1, status: 1 });
tankSchema.index({ installationDate: -1 });

module.exports = mongoose.model('Tank', tankSchema);
