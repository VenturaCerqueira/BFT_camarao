const mongoose = require('mongoose');

const tankExpenseSchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    required: true,
    enum: ['Alimentação', 'Manutenção', 'Energia', 'Água', 'Produtos Químicos', 'Equipamentos', 'Mão de Obra', 'Outros'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    min: 0,
    default: 1
  },
  unit: {
    type: String,
    trim: true,
    default: 'unidade'
  },
  unitPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  supplier: {
    type: String,
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
tankExpenseSchema.index({ createdBy: 1, expenseDate: -1 });
tankExpenseSchema.index({ tankId: 1, expenseDate: -1 });
tankExpenseSchema.index({ category: 1, createdBy: 1 });

module.exports = mongoose.model('TankExpense', tankExpenseSchema);
