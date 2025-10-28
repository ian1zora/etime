const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createOrder);

module.exports = router;
