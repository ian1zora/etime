const express = require('express');
const { Producto, Categoria } = require('../models');
const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [['categoria_id', 'ASC'], ['nombre_producto', 'ASC']]
    });
    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error productos:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo productos' });
  }
});

// Obtener productos por categoría
router.get('/categoria/:id', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { categoria_id: req.params.id, disponible: true },
      order: [['nombre_producto', 'ASC']]
    });
    res.json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo productos' });
  }
});

module.exports = router;