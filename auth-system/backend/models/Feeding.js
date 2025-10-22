const mongoose = require('mongoose');

const feedingSchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  feedingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  feedType: {
    type: String,
    required: true,
    trim: true
  },
  feedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  feedUnit: {
    type: String,
    enum: ['kg', 'g', 'lbs'],
    default: 'kg'
  },
  aerationTime: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  equipmentMaintenance: {
    pumps: {
      type: Boolean,
      default: false
    },
    aerators: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Boolean,
      default: false
    },
    otherEquipment: {
      type: String,
      trim: true
    }
  },
  inputs: {
    lime: {
      quantity: {
        type: Number,
        min: 0,
        default: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lbs'],
        default: 'kg'
      }
    },
    molasses: {
      quantity: {
        type: Number,
        min: 0,
        default: 0
      },
      unit: {
        type: String,
        enum: ['L', 'mL', 'gal'],
        default: 'L'
      }
    },
    probiotics: {
      quantity: {
        type: Number,
        min: 0,
        default: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lbs', 'L', 'mL'],
        default: 'g'
      }
    },
    otherInputs: [{
      name: {
        type: String,
        trim: true
      },
      quantity: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        trim: true
      }
    }]
  },
  waterExchange: {
    performed: {
      type: Boolean,
      default: false
    },
    volume: {
      type: Number,
      min: 0
    },
    volumeUnit: {
      type: String,
      enum: ['L', 'm³', 'gal'],
      default: 'L'
    },
    reason: {
      type: String,
      trim: true
    }
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
feedingSchema.index({ createdBy: 1, feedingDate: -1 });
feedingSchema.index({ tankId: 1, feedingDate: -1 });

module.exports = mongoose.model('Feeding', feedingSchema);
