const express = require('express');
const router = express.Router();
const { Categoria } = require('../models');

// Simple: devuelve todas las categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
