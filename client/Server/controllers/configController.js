const { Configuracion } = require('../models');

exports.getAllSettings = async (req, res) => {
  const data = await Configuracion.findAll();
  res.json(data);
};

exports.updateSetting = async (req, res) => {
  const { clave } = req.params;
  const { valor } = req.body;

  const setting = await Configuracion.findOne({ where: { clave } });
  if (!setting) return res.status(404).json({ message: 'Configuración no encontrada' });

  setting.valor = valor;
  await setting.save();
  res.json(setting);
};
