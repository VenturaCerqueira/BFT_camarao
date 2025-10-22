const express = require('express');
const TankExpense = require('../models/TankExpense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, tankId, category } = req.query;

    let query = { createdBy: req.user.userId };

    // Add tankId filter if provided
    if (tankId) {
      query.tankId = tankId;
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const expenses = await TankExpense.find(query)
      .sort({ expenseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username')
      .populate('tankId', 'name');

    const total = await TankExpense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar despesas' });
  }
});

// Get financial metrics for dashboard
router.get('/metrics', auth, async (req, res) => {
  try {
    const { tankId, startDate, endDate } = req.query;

    let query = { createdBy: req.user.userId };

    if (tankId) {
      query.tankId = tankId;
    }

    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    // Calculate total expenses
    const totalExpenses = await TankExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate expenses by category
    const expensesByCategory = await TankExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate monthly expenses
    const monthlyExpenses = await TankExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get expenses by tank
    const expensesByTank = await TankExpense.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'tanks',
          localField: 'tankId',
          foreignField: '_id',
          as: 'tank'
        }
      },
      {
        $unwind: '$tank'
      },
      {
        $group: {
          _id: '$tankId',
          tankName: { $first: '$tank.name' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      totalExpenses: totalExpenses[0] || { total: 0, count: 0 },
      expensesByCategory,
      monthlyExpenses,
      expensesByTank
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao calcular métricas financeiras' });
  }
});

// Create new expense
router.post('/', auth, async (req, res) => {
  try {
    const { tankId, expenseDate, category, description, amount, quantity, unit, unitPrice, supplier, notes } = req.body;

    // Validate required fields
    if (!tankId || !category || !description || !amount) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validate tank exists and belongs to user
    const tank = await require('../models/Tank').findOne({ _id: tankId, createdBy: req.user.userId });
    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    // Validate amount
    if (amount < 0) {
      return res.status(400).json({ message: 'Valor deve ser maior que zero' });
    }

    const expense = new TankExpense({
      tankId,
      expenseDate: new Date(expenseDate || Date.now()),
      category: category.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      quantity: parseFloat(quantity || 1),
      unit: unit?.trim() || 'unidade',
      unitPrice: parseFloat(unitPrice || 0),
      supplier: supplier?.trim() || '',
      notes: notes?.trim() || '',
      createdBy: req.user.userId
    });

    await expense.save();

    res.status(201).json({
      message: 'Despesa cadastrada com sucesso',
      expense
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar despesa' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, amount, quantity, unit, unitPrice, supplier, notes } = req.body;

    const expense = await TankExpense.findOne({ _id: id, createdBy: req.user.userId });

    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    // Update fields
    if (category) expense.category = category.trim();
    if (description) expense.description = description.trim();
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (quantity !== undefined) expense.quantity = parseFloat(quantity);
    if (unit) expense.unit = unit.trim();
    if (unitPrice !== undefined) expense.unitPrice = parseFloat(unitPrice);
    if (supplier !== undefined) expense.supplier = supplier?.trim() || '';
    if (notes !== undefined) expense.notes = notes?.trim() || '';

    await expense.save();

    res.json({
      message: 'Despesa atualizada com sucesso',
      expense
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar despesa' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await TankExpense.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir despesa' });
  }
});

module.exports = router;
