const express = require('express');
const router = express.Router();
const { getAllSettings, updateSetting } = require('../controllers/configController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Obtener todas las configuraciones (solo admin)
router.get('/', auth, admin, getAllSettings);

// Actualizar una configuración (por clave)
router.put('/:clave', auth, admin, updateSetting);

module.exports = router;
