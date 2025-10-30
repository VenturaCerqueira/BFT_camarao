const mongoose = require('mongoose');
const TankData = require('../../auth-system/backend/models/TankData');
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

    if (path === '/.netlify/functions/tank' && method === 'GET') {
      const { page = 1, limit = 10, startDate, endDate, tankId } = queryParams;

      let query = { createdBy: decoded.userId };
      if (tankId) query.tankId = tankId;
      if (startDate || endDate) {
        query.inspectionDate = {};
        if (startDate) query.inspectionDate.$gte = new Date(startDate);
        if (endDate) query.inspectionDate.$lte = new Date(endDate);
      }

      const tankData = await TankData.find(query)
        .sort({ inspectionDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'username')
        .populate('tankId', 'name');

      const total = await TankData.countDocuments(query);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          tankData,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        })
      };

    } else if (path === '/.netlify/functions/tank/dashboard' && method === 'GET') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const tankData = await TankData.find({
        createdBy: decoded.userId,
        inspectionDate: { $gte: thirtyDaysAgo }
      })
        .sort({ inspectionDate: 1 })
        .select('ph temperature oxygenation nitrite ammonia inspectionDate feedingDate');

      const latestRecord = await TankData.findOne({ createdBy: decoded.userId })
        .sort({ inspectionDate: -1 })
        .select('ph temperature oxygenation nitrite ammonia inspectionDate feedingDate responsible notes');

      const averages = tankData.length > 0 ? {
        ph: (tankData.reduce((sum, record) => sum + record.ph, 0) / tankData.length).toFixed(1),
        temperature: (tankData.reduce((sum, record) => sum + record.temperature, 0) / tankData.length).toFixed(1),
        oxygenation: (tankData.reduce((sum, record) => sum + record.oxygenation, 0) / tankData.length).toFixed(1),
        nitrite: (tankData.reduce((sum, record) => sum + record.nitrite, 0) / tankData.length).toFixed(2),
        ammonia: (tankData.reduce((sum, record) => sum + record.ammonia, 0) / tankData.length).toFixed(2)
      } : { ph: '0.0', temperature: '0.0', oxygenation: '0.0', nitrite: '0.00', ammonia: '0.00' };

      const activeTanks = await Tank.find({
        createdBy: decoded.userId,
        status: 'Ativo'
      }).select('name');

      const tanksWithData = await Promise.all(activeTanks.map(async (tank) => {
        const latestData = await TankData.findOne({
          tankId: tank._id,
          createdBy: decoded.userId
        })
          .sort({ inspectionDate: -1 })
          .select('ph temperature oxygenation nitrite ammonia salinity nitrate alkalinity turbidity orp co2');

        return {
          id: tank._id,
          name: tank.name,
          ph: latestData ? latestData.ph.toString() : '0.0',
          temperature: latestData ? latestData.temperature.toString() : '0.0',
          oxygenation: latestData ? latestData.oxygenation.toString() : '0.0',
          nitrite: latestData ? latestData.nitrite.toString() : '0.00',
          ammonia: latestData ? latestData.ammonia.toString() : '0.00',
          salinity: latestData ? latestData.salinity.toString() : '0.0',
          nitrate: latestData ? latestData.nitrate.toString() : '0.0',
          alkalinity: latestData ? latestData.alkalinity.toString() : '0.0',
          turbidity: latestData ? latestData.turbidity.toString() : '0.0',
          orp: latestData ? latestData.orp.toString() : '0.0',
          co2: latestData ? latestData.co2.toString() : '0.0'
        };
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          chartData: tankData,
          latestRecord,
          averages,
          totalRecords: tankData.length,
          activeTanks: tanksWithData
        })
      };

    } else if (path === '/.netlify/functions/tank' && method === 'POST') {
      const { tankId, ph, temperature, oxygenation, nitrite, ammonia, salinity, nitrate, alkalinity, turbidity, orp, co2, inspectionDate, feedingDate, responsible, notes } = body;

      if (!tankId || !ph || !temperature || !oxygenation || !nitrite || !ammonia || !inspectionDate || !feedingDate || !responsible) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }) };
      }

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      if (ph < 0 || ph > 14) return { statusCode: 400, headers, body: JSON.stringify({ message: 'pH deve estar entre 0 e 14' }) };
      if (temperature < 0 || temperature > 50) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Temperatura deve estar entre 0°C e 50°C' }) };
      if (oxygenation < 0) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Oxigenação deve ser maior que 0' }) };
      if (nitrite < 0) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nitrito deve ser maior que 0' }) };
      if (ammonia < 0) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Amônia deve ser maior que 0' }) };

      const tankData = new TankData({
        tankId,
        ph: parseFloat(ph),
        temperature: parseFloat(temperature),
        oxygenation: parseFloat(oxygenation),
        nitrite: parseFloat(nitrite),
        ammonia: parseFloat(ammonia),
        salinity: parseFloat(salinity || 0),
        nitrate: parseFloat(nitrate || 0),
        alkalinity: parseFloat(alkalinity || 0),
        turbidity: parseFloat(turbidity || 0),
        orp: parseFloat(orp || 0),
        co2: parseFloat(co2 || 0),
        inspectionDate: new Date(inspectionDate),
        feedingDate: new Date(feedingDate),
        responsible: responsible.trim(),
        notes: notes?.trim() || '',
        createdBy: decoded.userId
      });

      await tankData.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Dados do tanque cadastrados com sucesso', tankData }) };

    } else if (path.startsWith('/.netlify/functions/tank/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { ph, temperature, oxygenation, nitrite, ammonia, inspectionDate, feedingDate, responsible, notes } = body;

      const tankData = await TankData.findOne({ _id: id, createdBy: decoded.userId });
      if (!tankData) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Registro não encontrado' }) };
      }

      if (ph !== undefined) tankData.ph = parseFloat(ph);
      if (temperature !== undefined) tankData.temperature = parseFloat(temperature);
      if (oxygenation !== undefined) tankData.oxygenation = parseFloat(oxygenation);
      if (nitrite !== undefined) tankData.nitrite = parseFloat(nitrite);
      if (ammonia !== undefined) tankData.ammonia = parseFloat(ammonia);
      if (inspectionDate) tankData.inspectionDate = new Date(inspectionDate);
      if (feedingDate) tankData.feedingDate = new Date(feedingDate);
      if (responsible) tankData.responsible = responsible.trim();
      if (notes !== undefined) tankData.notes = notes?.trim() || '';

      await tankData.save();

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Dados atualizados com sucesso', tankData }) };

    } else if (path.startsWith('/.netlify/functions/tank/') && method === 'DELETE') {
      const id = path.split('/').pop();

      const tankData = await TankData.findOneAndDelete({ _id: id, createdBy: decoded.userId });
      if (!tankData) {
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
