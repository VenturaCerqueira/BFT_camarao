const mongoose = require('mongoose');
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

    if (path === '/.netlify/functions/tanks' && method === 'GET') {
      const { page = 1, limit = 10, status } = queryParams;

      let query = { createdBy: decoded.userId };
      if (status) query.status = status;

      const tanks = await Tank.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'username');

      const total = await Tank.countDocuments(query);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          tanks,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        })
      };

    } else if (path.startsWith('/.netlify/functions/tanks/') && !path.includes('/dashboard') && method === 'GET') {
      const id = path.split('/').pop();

      const tank = await Tank.findOne({ _id: id, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify(tank) };

    } else if (path === '/.netlify/functions/tanks' && method === 'POST') {
      const { name, capacity, size, installationDate, expiryDate, feedingType, technicalResponsible, status, notes } = body;

      if (!name || !capacity || !size || !installationDate || !expiryDate || !feedingType || !technicalResponsible) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }) };
      }

      const installDate = new Date(installationDate);
      const expDate = new Date(expiryDate);

      if (expDate <= installDate) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Data de validade deve ser posterior à data de instalação' }) };
      }

      const validFeedingTypes = ['Natural', 'Artificial', 'Mista'];
      if (!validFeedingTypes.includes(feedingType)) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Tipo de alimentação inválido' }) };
      }

      const tank = new Tank({
        name: name.trim(),
        capacity: parseFloat(capacity),
        size: parseFloat(size),
        installationDate: installDate,
        expiryDate: expDate,
        feedingType,
        technicalResponsible: technicalResponsible.trim(),
        status: status || 'Ativo',
        notes: notes?.trim() || '',
        createdBy: decoded.userId
      });

      await tank.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Tanque cadastrado com sucesso', tank }) };

    } else if (path.startsWith('/.netlify/functions/tanks/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, capacity, size, installationDate, expiryDate, feedingType, technicalResponsible, status, notes } = body;

      const tank = await Tank.findOne({ _id: id, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      if (name) tank.name = name.trim();
      if (capacity) tank.capacity = parseFloat(capacity);
      if (size) tank.size = parseFloat(size);
      if (installationDate) tank.installationDate = new Date(installationDate);
      if (expiryDate) tank.expiryDate = new Date(expiryDate);
      if (feedingType) tank.feedingType = feedingType;
      if (technicalResponsible) tank.technicalResponsible = technicalResponsible.trim();
      if (status) tank.status = status;
      if (notes !== undefined) tank.notes = notes?.trim() || '';

      await tank.save();

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Tanque atualizado com sucesso', tank }) };

    } else if (path.startsWith('/.netlify/functions/tanks/') && method === 'DELETE') {
      const id = path.split('/').pop();

      const tank = await Tank.findOneAndDelete({ _id: id, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Tanque excluído com sucesso' }) };

    } else if (path === '/.netlify/functions/tanks/dashboard/stats' && method === 'GET') {
      const totalTanks = await Tank.countDocuments({ createdBy: decoded.userId });
      const activeTanks = await Tank.countDocuments({ createdBy: decoded.userId, status: 'Ativo' });
      const maintenanceTanks = await Tank.countDocuments({ createdBy: decoded.userId, status: 'Manutenção' });

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringSoon = await Tank.countDocuments({
        createdBy: decoded.userId,
        expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
        status: 'Ativo'
      });

      const capacityStats = await Tank.aggregate([
        { $match: { createdBy: mongoose.Types.ObjectId(decoded.userId) } },
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: '$capacity' },
            avgCapacity: { $avg: '$capacity' }
          }
        }
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalTanks,
          activeTanks,
          maintenanceTanks,
          expiringSoon,
          capacityStats: capacityStats[0] || { totalCapacity: 0, avgCapacity: 0 }
        })
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Route not found' }) };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
