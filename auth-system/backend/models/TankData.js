const mongoose = require('mongoose');

const tankDataSchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  ph: {
    type: Number,
    required: true,
    min: 0,
    max: 14
  },
  temperature: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  oxygenation: {
    type: Number,
    required: true,
    min: 0
  },
  nitrite: {
    type: Number,
    required: true,
    min: 0
  },
  ammonia: {
    type: Number,
    required: true,
    min: 0
  },
  salinity: {
    type: Number,
    min: 0,
    default: 0
  },
  nitrate: {
    type: Number,
    min: 0,
    default: 0
  },
  alkalinity: {
    type: Number,
    min: 0,
    default: 0
  },
  turbidity: {
    type: Number,
    min: 0,
    default: 0
  },
  orp: {
    type: Number,
    default: 0
  },
  co2: {
    type: Number,
    min: 0,
    default: 0
  },
  inspectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  feedingDate: {
    type: Date,
    required: true
  },
  responsible: {
    type: String,
    required: true,
    trim: true
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
tankDataSchema.index({ createdBy: 1, inspectionDate: -1 });
tankDataSchema.index({ inspectionDate: -1 });

module.exports = mongoose.model('TankData', tankDataSchema);
