const { Configuracion } = require('../models');

//  Obtener todas las configuraciones (solo admin)
exports.getAllSettings = async (req, res) => {
  try {
    const configs = await Configuracion.findAll();
    res.json(configs);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ message: 'Error al obtener configuraciones', error });
  }
};

//  Actualizar una configuración (por clave)
exports.updateSetting = async (req, res) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;

    const config = await Configuracion.findOne({ where: { clave } });
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    config.valor = valor;
    await config.save();

    res.json({ message: 'Configuración actualizada correctamente', config });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error al actualizar configuración', error });
  }
};
