const express = require('express');
const Shrimp = require('../models/Shrimp');
const auth = require('../middleware/auth');

const router = express.Router();

// Get shrimp data for dashboard (biological data averages)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const shrimpData = await Shrimp.find({ createdBy: req.user.userId })
      .sort({ evaluationDate: -1 })
      .select('biometria sobrevivencia fcr densidadeEstocagem sanidade');

    if (shrimpData.length === 0) {
      return res.json({
        averageWeight: '0.0',
        survival: '0.0',
        fcr: '0.0',
        stockingDensity: '0',
        healthStatus: 'Nenhum dado'
      });
    }

    // Calculate averages for numerical fields
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

    // Get latest health status
    const latestHealth = shrimpData.find(s => s.sanidade)?.sanidade || 'Nenhum dado';

    res.json({
      averageWeight,
      survival,
      fcr,
      stockingDensity: stockingDensity.toString(),
      healthStatus: latestHealth
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados biológicos do dashboard' });
  }
});

// Get all shrimp data for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tankId } = req.query;

    let query = { createdBy: req.user.userId };

    if (tankId) {
      query.tankId = tankId;
    }

    const shrimp = await Shrimp.find(query)
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('tankId', 'name')
      .populate('createdBy', 'username');

    const total = await Shrimp.countDocuments(query);

    res.json({
      shrimp,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados dos camarões' });
  }
});

// Get shrimp data by tank
router.get('/tank/:tankId', auth, async (req, res) => {
  try {
    const { tankId } = req.params;

    // Validate tank exists and belongs to user
    const tank = await require('../models/Tank').findOne({ _id: tankId, createdBy: req.user.userId });
    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    const shrimp = await Shrimp.find({
      tankId,
      createdBy: req.user.userId
    })
      .sort({ startDate: -1 })
      .populate('createdBy', 'username');

    res.json({ shrimp });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar camarões do tanque' });
  }
});

// Create new shrimp data
router.post('/', auth, async (req, res) => {
  try {
    const { tankId, shrimpType, startDate, daysOfLife, evaluationDate, biometria, sobrevivencia, fcr, densidadeEstocagem, sanidade, notes } = req.body;

    // Validate required fields
    if (!tankId || !shrimpType || !startDate || !daysOfLife || !evaluationDate) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validate tank exists and belongs to user
    const tank = await require('../models/Tank').findOne({ _id: tankId, createdBy: req.user.userId });
    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    // Validate daysOfLife
    if (daysOfLife < 1) {
      return res.status(400).json({ message: 'Dias de vida deve ser maior que 0' });
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
      createdBy: req.user.userId
    });

    await shrimp.save();

    res.status(201).json({
      message: 'Dados dos camarões cadastrados com sucesso',
      shrimp
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar dados dos camarões' });
  }
});

// Update shrimp data
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { shrimpType, startDate, daysOfLife, evaluationDate, biometria, sobrevivencia, fcr, densidadeEstocagem, sanidade, notes, status } = req.body;

    const shrimp = await Shrimp.findOne({ _id: id, createdBy: req.user.userId });

    if (!shrimp) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    // Update fields
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

    res.json({
      message: 'Dados atualizados com sucesso',
      shrimp
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dados dos camarões' });
  }
});

// Delete shrimp data
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const shrimp = await Shrimp.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!shrimp) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir registro' });
  }
});

module.exports = router;
