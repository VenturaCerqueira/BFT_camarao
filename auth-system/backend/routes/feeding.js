const express = require('express');
const Feeding = require('../models/Feeding');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all feeding records for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tankId, startDate, endDate } = req.query;

    let query = { createdBy: req.user.userId };

    if (tankId) {
      query.tankId = tankId;
    }

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

    res.json({
      feeding,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar registros de alimentação' });
  }
});

// Get feeding records by tank
router.get('/tank/:tankId', auth, async (req, res) => {
  try {
    const { tankId } = req.params;

    // Validate tank exists and belongs to user
    const tank = await require('../models/Tank').findOne({ _id: tankId, createdBy: req.user.userId });
    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    const feeding = await Feeding.find({
      tankId,
      createdBy: req.user.userId
    })
      .sort({ feedingDate: -1 })
      .populate('createdBy', 'username');

    res.json({ feeding });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar alimentação do tanque' });
  }
});

// Create new feeding record
router.post('/', auth, async (req, res) => {
  try {
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
    } = req.body;

    // Validate required fields
    if (!tankId || !feedingDate || !feedType || !feedQuantity || !aerationTime || !responsible) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validate tank exists and belongs to user
    const tank = await require('../models/Tank').findOne({ _id: tankId, createdBy: req.user.userId });
    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    // Validate feed quantity
    if (feedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantidade de ração deve ser maior que 0' });
    }

    // Validate aeration time
    if (aerationTime < 0 || aerationTime > 24) {
      return res.status(400).json({ message: 'Tempo de aeração deve estar entre 0 e 24 horas' });
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
      createdBy: req.user.userId
    });

    await feeding.save();

    res.status(201).json({
      message: 'Registro de alimentação cadastrado com sucesso',
      feeding
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar registro de alimentação' });
  }
});

// Update feeding record
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    const feeding = await Feeding.findOne({ _id: id, createdBy: req.user.userId });

    if (!feeding) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    // Update fields
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

    res.json({
      message: 'Registro atualizado com sucesso',
      feeding
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar registro de alimentação' });
  }
});

// Delete feeding record
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const feeding = await Feeding.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!feeding) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir registro' });
  }
});

module.exports = router;
