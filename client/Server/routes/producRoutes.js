const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct } = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Listar todos los productos (público)
router.get('/', getAllProducts);

// Crear nuevo producto (solo admin)
router.post('/', auth, admin, createProduct);

// Aquí podrías agregar update y delete:
/// router.put('/:id', auth, admin, updateProduct);
/// router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
