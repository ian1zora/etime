const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Listar todos los productos (público)
router.get('/', getAllProducts);

// Obtener producto por id
router.get('/:id', getProductById);

// Listar productos por categoría
router.get('/category/:id', getProductsByCategory);

// Crear nuevo producto (solo admin)
router.post('/', auth, admin, createProduct);

// Actualizar producto (admin)
router.put('/:id', auth, admin, updateProduct);

// Eliminar producto (admin)
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
