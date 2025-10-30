const mongoose = require('mongoose');
const Shrimp = require('../../auth-system/backend/models/Shrimp');
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

    if (path === '/.netlify/functions/shrimp/dashboard' && method === 'GET') {
      const shrimpData = await Shrimp.find({ createdBy: decoded.userId })
        .sort({ evaluationDate: -1 })
        .select('biometria sobrevivencia fcr densidadeEstocagem sanidade');

      if (shrimpData.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            averageWeight: '0.0',
            survival: '0.0',
            fcr: '0.0',
            stockingDensity: '0',
            healthStatus: 'Nenhum dado'
          })
        };
      }

      const validBiometria = shrimpData.filter(s => s.biometria != null);
      const validSobrevivencia = shrimpData.filter(s => s.sobrevivencia != null);
      const validFcr = shrimpData.filter(s => s.fcr != null);
      const validDensidade = shrimpData.filter(s => s.densidadeEstocagem != null);

      const averageWeight = validBiometria.length > 0
        ? (validBiometria.reduce((sum, s) => sum + s.biometria, 0) / validBiometria.length).toFixed(1)
        : '0.0';

      const survival = validSobrevivencia.length > 0
        ? (validSobrevivencia.reduce((sum, s) => sum + s.sobrevivencia, 0) / validSobrevivencia.length).toFixed(1)
        : '0.0';

      const fcr = validFcr.length > 0
        ? (validFcr.reduce((sum, s) => sum + s.fcr, 0) / validFcr.length).toFixed(2)
        : '0.0';

      const stockingDensity = validDensidade.length > 0
        ? Math.round(validDensidade.reduce((sum, s) => sum + s.densidadeEstocagem, 0) / validDensidade.length)
        : '0';

      const latestHealth = shrimpData.find(s => s.sanidade)?.sanidade || 'Nenhum dado';

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          averageWeight,
          survival,
          fcr,
          stockingDensity: stockingDensity.toString(),
          healthStatus: latestHealth
        })
      };

    } else if (path === '/.netlify/functions/shrimp' && method === 'GET') {
      const { page = 1, limit = 10, tankId } = queryParams;

      let query = { createdBy: decoded.userId };
      if (tankId) query.tankId = tankId;

      const shrimp = await Shrimp.find(query)
        .sort({ startDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('tankId', 'name')
        .populate('createdBy', 'username');

      const total = await Shrimp.countDocuments(query);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          shrimp,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        })
      };

    } else if (path.startsWith('/.netlify/functions/shrimp/tank/') && method === 'GET') {
      const tankId = path.split('/').pop();

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      const shrimp = await Shrimp.find({
        tankId,
        createdBy: decoded.userId
      })
        .sort({ startDate: -1 })
        .populate('createdBy', 'username');

      return { statusCode: 200, headers, body: JSON.stringify({ shrimp }) };

    } else if (path === '/.netlify/functions/shrimp' && method === 'POST') {
      const { tankId, shrimpType, startDate, daysOfLife, evaluationDate, biometria, sobrevivencia, fcr, densidadeEstocagem, sanidade, notes } = body;

      if (!tankId || !shrimpType || !startDate || !daysOfLife || !evaluationDate) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Todos os campos obrigatórios devem ser preenchidos' }) };
      }

      const tank = await Tank.findOne({ _id: tankId, createdBy: decoded.userId });
      if (!tank) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tanque não encontrado' }) };
      }

      if (daysOfLife < 1) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Dias de vida deve ser maior que 0' }) };
      }

      const shrimp = new Shrimp({
        tankId,
        shrimpType: shrimpType.trim(),
        startDate: new Date(startDate),
        daysOfLife: parseInt(daysOfLife),
        evaluationDate: new Date(evaluationDate),
        biometria: biometria ? parseFloat(biometria) : undefined,
        sobrevivencia: sobrevivencia ? parseFloat(sobrevivencia) : undefined,
        fcr: fcr ? parseFloat(fcr) : undefined,
        densidadeEstocagem: densidadeEstocagem ? parseFloat(densidadeEstocagem) : undefined,
        sanidade: sanidade?.trim() || '',
        notes: notes?.trim() || '',
        createdBy: decoded.userId
      });

      await shrimp.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Dados dos camarões cadastrados com sucesso', shrimp }) };

    } else if (path.startsWith('/.netlify/functions/shrimp/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { shrimpType, startDate, daysOfLife, evaluationDate, biometria, sobrevivencia, fcr, densidadeEstocagem, sanidade, notes, status } = body;

      const shrimp = await Shrimp.findOne({ _id: id, createdBy: decoded.userId });
      if (!shrimp) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Registro não encontrado' }) };
      }

      if (shrimpType) shrimp.shrimpType = shrimpType.trim();
      if (startDate) shrimp.startDate = new Date(startDate);
      if (daysOfLife) shrimp.daysOfLife = parseInt(daysOfLife);
      if (evaluationDate) shrimp.evaluationDate = new Date(evaluationDate);
      if (biometria !== undefined) shrimp.biometria = biometria ? parseFloat(biometria) : undefined;
      if (sobrevivencia !== undefined) shrimp.sobrevivencia = sobrevivencia ? parseFloat(sobrevivencia) : undefined;
      if (fcr !== undefined) shrimp.fcr = fcr ? parseFloat(fcr) : undefined;
      if (densidadeEstocagem !== undefined) shrimp.densidadeEstocagem = densidadeEstocagem ? parseFloat(densidadeEstocagem) : undefined;
      if (sanidade !== undefined) shrimp.sanidade = sanidade?.trim() || '';
      if (notes !== undefined) shrimp.notes = notes?.trim() || '';
      if (status) shrimp.status = status;

      await shrimp.save();

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Dados atualizados com sucesso', shrimp }) };

    } else if (path.startsWith('/.netlify/functions/shrimp/') && method === 'DELETE') {
      const id = path.split('/').pop();

      const shrimp = await Shrimp.findOneAndDelete({ _id: id, createdBy: decoded.userId });
      if (!shrimp) {
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
