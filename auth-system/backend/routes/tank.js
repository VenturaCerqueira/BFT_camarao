const express = require('express');
const TankData = require('../models/TankData');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tank data for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let query = { createdBy: req.user.userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.inspectionDate = {};
      if (startDate) query.inspectionDate.$gte = new Date(startDate);
      if (endDate) query.inspectionDate.$lte = new Date(endDate);
    }

    const tankData = await TankData.find(query)
      .sort({ inspectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username');

    const total = await TankData.countDocuments(query);

    res.json({
      tankData,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do tanque' });
  }
});

// Get tank data for dashboard (last 30 days)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tankData = await TankData.find({
      createdBy: req.user.userId,
      inspectionDate: { $gte: thirtyDaysAgo }
    })
      .sort({ inspectionDate: 1 })
      .select('ph temperature oxygenation nitrite ammonia inspectionDate feedingDate');

    // Get latest record
    const latestRecord = await TankData.findOne({
      createdBy: req.user.userId
    })
      .sort({ inspectionDate: -1 })
      .select('ph temperature oxygenation nitrite ammonia inspectionDate feedingDate responsible notes');

    // Calculate averages
    const averages = tankData.length > 0 ? {
      ph: (tankData.reduce((sum, record) => sum + record.ph, 0) / tankData.length).toFixed(1),
      temperature: (tankData.reduce((sum, record) => sum + record.temperature, 0) / tankData.length).toFixed(1),
      oxygenation: (tankData.reduce((sum, record) => sum + record.oxygenation, 0) / tankData.length).toFixed(1),
      nitrite: (tankData.reduce((sum, record) => sum + record.nitrite, 0) / tankData.length).toFixed(2),
      ammonia: (tankData.reduce((sum, record) => sum + record.ammonia, 0) / tankData.length).toFixed(2)
    } : { ph: '0.0', temperature: '0.0', oxygenation: '0.0', nitrite: '0.00', ammonia: '0.00' };

    res.json({
      chartData: tankData,
      latestRecord,
      averages,
      totalRecords: tankData.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
  }
});

// Create new tank data
router.post('/', auth, async (req, res) => {
  try {
    const { ph, temperature, oxygenation, nitrite, ammonia, inspectionDate, feedingDate, responsible, notes } = req.body;

    // Validate required fields
    if (!ph || !temperature || !oxygenation || !nitrite || !ammonia || !inspectionDate || !feedingDate || !responsible) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validate ranges
    if (ph < 0 || ph > 14) {
      return res.status(400).json({ message: 'pH deve estar entre 0 e 14' });
    }

    if (temperature < 0 || temperature > 50) {
      return res.status(400).json({ message: 'Temperatura deve estar entre 0°C e 50°C' });
    }

    if (oxygenation < 0) {
      return res.status(400).json({ message: 'Oxigenação deve ser maior que 0' });
    }

    if (nitrite < 0) {
      return res.status(400).json({ message: 'Nitrito deve ser maior que 0' });
    }

    if (ammonia < 0) {
      return res.status(400).json({ message: 'Amônia deve ser maior que 0' });
    }

    const tankData = new TankData({
      ph: parseFloat(ph),
      temperature: parseFloat(temperature),
      oxygenation: parseFloat(oxygenation),
      nitrite: parseFloat(nitrite),
      ammonia: parseFloat(ammonia),
      inspectionDate: new Date(inspectionDate),
      feedingDate: new Date(feedingDate),
      responsible: responsible.trim(),
      notes: notes?.trim() || '',
      createdBy: req.user.userId
    });

    await tankData.save();

    res.status(201).json({
      message: 'Dados do tanque cadastrados com sucesso',
      tankData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar dados do tanque' });
  }
});

// Update tank data
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { ph, temperature, oxygenation, nitrite, ammonia, inspectionDate, feedingDate, responsible, notes } = req.body;

    const tankData = await TankData.findOne({ _id: id, createdBy: req.user.userId });

    if (!tankData) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    // Update fields
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

    res.json({
      message: 'Dados atualizados com sucesso',
      tankData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dados do tanque' });
  }
});

// Delete tank data
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const tankData = await TankData.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!tankData) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir registro' });
  }
});

module.exports = router;
