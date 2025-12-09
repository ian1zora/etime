const express = require('express');
const { Categoria } = require('../models');
const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activo: true },
      order: [['orden_display', 'ASC'], ['nombre', 'ASC']]
    });
    res.json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo categorías' });
  }
});

module.exports = router;