const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { nombre_usuario, gmail, contrasena } = req.body;
    const existe = await Usuario.findOne({ where: { gmail } });
    if (existe) return res.status(400).json({ message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const user = await Usuario.create({ nombre_usuario, gmail, contrasena: hash });
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { gmail, contrasena } = req.body;
    const user = await Usuario.findOne({ where: { gmail } });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(contrasena, user.contrasena);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
