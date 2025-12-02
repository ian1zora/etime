const express = require('express');
const router = express.Router();

// Ruta temporal de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

module.exports = router;