// Server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  listOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Crear nuevo pedido (cliente autenticado)
router.post('/', auth, createOrder);

// Obtener pedidos (admin)
router.get('/', auth, admin, listOrders);

// Obtener pedidos del usuario autenticado
router.get('/my', auth, getMyOrders);

// Obtener pedido por id (propietario o admin)
router.get('/:id', auth, getOrderById);

// Actualizar estado de pedido (solo admin)  <-- ESTE ES EL PUT QUE NO TE ANDABA
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;
