const mongoose = require('mongoose');
const TankExpense = require('../../auth-system/backend/models/TankExpense');
const Tank = require('../../auth-system/backend/models/Tank');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!mongoose.connection.readyState) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ message: 'Database connection failed' }) };
    }
  }

  const authMiddleware = async (token) => {
    if (!token) throw new Error('No token provided');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  };

  const { path } = event;
  const method = event.httpMethod;
  const body = JSON.parse(event.body || '{}');
  const queryParams = event.queryStringParameters || {};

  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    const decoded = await authMiddleware(token);

    if (path === '/.netlify/functions/expenses' && method === 'GET') {
      const { page = 1, limit = 10, startDate, endDate, tankId, category } = queryParams;

      let query = { createdBy: decoded.userId };
      if (tankId) query.tankId = tankId;
      if (category) query.category = category;
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          expenses,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        })
      };

    } else if (path === '/.netlify/functions/expenses/metrics' && method === 'GET') {
      const { tankId, startDate, endDate } = queryParams;

      let query = { createdBy: decoded.userId };
      if (tankId) query.tankId = tankId;
      if (startDate || endDate) {
        query.expenseDate = {};
        if (startDate) query.expenseDate.$gte = new Date(startDate);
        if (endDate) query.expenseDate.$lte = new Date(endDate);
      }

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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalExpenses: totalExpenses[0] || { total: 0, count: 0 },
          expensesByCategory,
          monthlyExpenses,
          expensesByTank
        })
      };

    } else if (path === '/.netlify/functions/expenses' && method === 'POST') {
      const { tankId, expenseDate, category, description, amount, quantity, unit, unitPrice, supplier, notes } = body;

      if (!tankId || !category || !description || !amount) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }) };
      }

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      if (amount < 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Valor deve ser maior que zero' }) };
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
        createdBy: decoded.userId
      });

      await expense.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Despesa cadastrada com sucesso', expense }) };

    } else if (path.startsWith('/.netlify/functions/expenses/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { category, description, amount, quantity, unit, unitPrice, supplier, notes } = body;

      const expense = await TankExpense.findOne({ _id: id, createdBy: decoded.userId });
      if (!expense) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Despesa não encontrada' }) };
      }

      if (category) expense.category = category.trim();
      if (description) expense.description = description.trim();
      if (amount !== undefined) expense.amount = parseFloat(amount);
      if (quantity !== undefined) expense.quantity = parseFloat(quantity);
      if (unit) expense.unit = unit.trim();
      if (unitPrice !== undefined) expense.unitPrice = parseFloat(unitPrice);
      if (supplier !== undefined) expense.supplier = supplier?.trim() || '';
      if (notes !== undefined) expense.notes = notes?.trim() || '';

      await expense.save();

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Despesa atualizada com sucesso', expense }) };

    } else if (path.startsWith('/.netlify/functions/expenses/') && method === 'DELETE') {
      const id = path.split('/').pop();

      const expense = await TankExpense.findOneAndDelete({ _id: id, createdBy: decoded.userId });
      if (!expense) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Despesa não encontrada' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Despesa excluída com sucesso' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Route not found' }) };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
