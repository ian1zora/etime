const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersForUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Crear nuevo pedido (cliente autenticado)
router.post('/', auth, createOrder);

// Lista de pedidos del usuario
router.get('/', auth, getOrdersForUser);

// Obtener un pedido por id (cliente/admin)
router.get('/:id', auth, getOrderById);

// Admin: listar todos los pedidos
router.get('/all/list', auth, admin, getAllOrders);

// Admin: cambiar estado de pedido
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;
