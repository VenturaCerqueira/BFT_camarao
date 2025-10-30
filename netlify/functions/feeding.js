const mongoose = require('mongoose');
const Feeding = require('../../auth-system/backend/models/Feeding');
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

    if (path === '/.netlify/functions/feeding' && method === 'GET') {
      const { page = 1, limit = 10, tankId, startDate, endDate } = queryParams;

      let query = { createdBy: decoded.userId };
      if (tankId) query.tankId = tankId;
      if (startDate && endDate) {
        query.feedingDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const feeding = await Feeding.find(query)
        .sort({ feedingDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('tankId', 'name')
        .populate('createdBy', 'username');

      const total = await Feeding.countDocuments(query);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          feeding,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        })
      };

    } else if (path.startsWith('/.netlify/functions/feeding/tank/') && method === 'GET') {
      const tankId = path.split('/').pop();

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      const feeding = await Feeding.find({
        tankId,
        createdBy: decoded.userId
      })
        .sort({ feedingDate: -1 })
        .populate('createdBy', 'username');

      return { statusCode: 200, headers, body: JSON.stringify({ feeding }) };

    } else if (path === '/.netlify/functions/feeding' && method === 'POST') {
      const {
        tankId,
        feedingDate,
        feedType,
        feedQuantity,
        feedUnit,
        aerationTime,
        equipmentMaintenance,
        inputs,
        waterExchange,
        responsible,
        notes
      } = body;

      if (!tankId || !feedingDate || !feedType || !feedQuantity || !aerationTime || !responsible) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }) };
      }

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      if (feedQuantity <= 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Quantidade de ração deve ser maior que 0' }) };
      }

      if (aerationTime < 0 || aerationTime > 24) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Tempo de aeração deve estar entre 0 e 24 horas' }) };
      }

      const feeding = new Feeding({
        tankId,
        feedingDate: new Date(feedingDate),
        feedType: feedType.trim(),
        feedQuantity: parseFloat(feedQuantity),
        feedUnit: feedUnit || 'kg',
        aerationTime: parseFloat(aerationTime),
        equipmentMaintenance: equipmentMaintenance || {},
        inputs: inputs || {},
        waterExchange: waterExchange || {},
        responsible: responsible.trim(),
        notes: notes?.trim() || '',
        createdBy: decoded.userId
      });

      await feeding.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Registro de alimentação cadastrado com sucesso', feeding }) };

    } else if (path.startsWith('/.netlify/functions/feeding/') && method === 'PUT') {
      const id = path.split('/').pop();
      const {
        feedingDate,
        feedType,
        feedQuantity,
        feedUnit,
        aerationTime,
        equipmentMaintenance,
        inputs,
        waterExchange,
        responsible,
        notes
      } = body;

      const feeding = await Feeding.findOne({ _id: id, createdBy: decoded.userId });
      if (!feeding) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Registro não encontrado' }) };
      }

      if (feedingDate) feeding.feedingDate = new Date(feedingDate);
      if (feedType) feeding.feedType = feedType.trim();
      if (feedQuantity) feeding.feedQuantity = parseFloat(feedQuantity);
      if (feedUnit) feeding.feedUnit = feedUnit;
      if (aerationTime !== undefined) feeding.aerationTime = parseFloat(aerationTime);
      if (equipmentMaintenance) feeding.equipmentMaintenance = equipmentMaintenance;
      if (inputs) feeding.inputs = inputs;
      if (waterExchange) feeding.waterExchange = waterExchange;
      if (responsible) feeding.responsible = responsible.trim();
      if (notes !== undefined) feeding.notes = notes?.trim() || '';

      await feeding.save();

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Registro atualizado com sucesso', feeding }) };

    } else if (path.startsWith('/.netlify/functions/feeding/') && method === 'DELETE') {
      const id = path.split('/').pop();

      const feeding = await Feeding.findOneAndDelete({ _id: id, createdBy: decoded.userId });
      if (!feeding) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Registro não encontrado' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Registro excluído com sucesso' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Route not found' }) };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
