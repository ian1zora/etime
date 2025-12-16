const express = require('express');
const { Categoria } = require('../models');
const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Error categorías:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo categorías' });
  }
});

module.exports = router;