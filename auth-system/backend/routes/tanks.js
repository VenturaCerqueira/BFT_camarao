const express = require('express');
const Tank = require('../models/Tank');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tanks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { createdBy: req.user.userId };

    if (status) {
      query.status = status;
    }

    const tanks = await Tank.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username');

    const total = await Tank.countDocuments(query);

    res.json({
      tanks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tanques' });
  }
});

// Get tank by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const tank = await Tank.findOne({ _id: id, createdBy: req.user.userId });

    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    res.json(tank);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tanque' });
  }
});

// Create new tank
router.post('/', auth, async (req, res) => {
  try {
    const { name, capacity, size, installationDate, expiryDate, feedingType, technicalResponsible, status, notes } = req.body;

    // Validate required fields
    if (!name || !capacity || !size || !installationDate || !expiryDate || !feedingType || !technicalResponsible) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validate dates
    const installDate = new Date(installationDate);
    const expDate = new Date(expiryDate);

    if (expDate <= installDate) {
      return res.status(400).json({ message: 'Data de validade deve ser posterior à data de instalação' });
    }

    // Validate feeding type
    const validFeedingTypes = ['Natural', 'Artificial', 'Mista'];
    if (!validFeedingTypes.includes(feedingType)) {
      return res.status(400).json({ message: 'Tipo de alimentação inválido' });
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
      createdBy: req.user.userId
    });

    await tank.save();

    res.status(201).json({
      message: 'Tanque cadastrado com sucesso',
      tank
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar tanque' });
  }
});

// Update tank
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, size, installationDate, expiryDate, feedingType, technicalResponsible, status, notes } = req.body;

    const tank = await Tank.findOne({ _id: id, createdBy: req.user.userId });

    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    // Update fields
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

    res.json({
      message: 'Tanque atualizado com sucesso',
      tank
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tanque' });
  }
});

// Delete tank
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const tank = await Tank.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId
    });

    if (!tank) {
      return res.status(404).json({ message: 'Tanque não encontrado' });
    }

    res.json({ message: 'Tanque excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir tanque' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalTanks = await Tank.countDocuments({ createdBy: userId });
    const activeTanks = await Tank.countDocuments({ createdBy: userId, status: 'Ativo' });
    const maintenanceTanks = await Tank.countDocuments({ createdBy: userId, status: 'Manutenção' });

    // Get tanks expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Tank.countDocuments({
      createdBy: userId,
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: 'Ativo'
    });

    // Get total capacity
    const capacityStats = await Tank.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          avgCapacity: { $avg: '$capacity' }
        }
      }
    ]);

    res.json({
      totalTanks,
      activeTanks,
      maintenanceTanks,
      expiringSoon,
      capacityStats: capacityStats[0] || { totalCapacity: 0, avgCapacity: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
