const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { nombre_usuario, email, contrasena } = req.body;
    console.log('Registro:', { nombre_usuario, email });
    const usuario = await Usuario.create({ nombre_usuario, email, contrasena, rol: 'cliente' });
    console.log('Usuario creado:', usuario.id);
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: usuario.id, nombre: usuario.nombre_usuario, email: usuario.email } });
  } catch (err) {
    console.error('Error registro:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    console.log('Login intento:', email);
    const usuario = await Usuario.buscarParaLogin(email);
    if (!usuario || !(await usuario.validarContrasena(contrasena))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    await usuario.registrarAcceso();
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Login exitoso:', usuario.id);
    res.json({ success: true, token, user: { id: usuario.id, nombre: usuario.nombre_usuario, email: usuario.email } });
  } catch (err) {
    console.error('Error login:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;