// Server/controllers/discountController.js
const { Descuento } = require('../models');

exports.listDiscounts = async (req, res) => {
  try {
    const descuentos = await Descuento.findAll();
    res.json(descuentos);
  } catch (err) {
    res.status(500).json({ message: "Error al listar descuentos", error: err.message || err });
  }
};

exports.getDiscount = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ message: "Descuento no encontrado" });
    res.json(descuento);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener descuento", error: err.message || err });
  }
};

exports.createDiscount = async (req, res) => {
  try {
    const { codigo, porcentaje, monto_fijo, activo } = req.body;
    if (!codigo) return res.status(400).json({ message: "Se requiere el código del descuento" });
    const nuevo = await Descuento.create({
      codigo,
      porcentaje: porcentaje ?? null,
      monto_fijo: monto_fijo ?? null,
      activo: activo === undefined ? true : !!activo
    });
    res.status(201).json({ message: "Descuento creado", descuento: nuevo });
  } catch (err) {
    res.status(500).json({ message: "Error al crear descuento", error: err.message || err });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ message: "Descuento no encontrado" });

    const { codigo, porcentaje, monto_fijo, activo } = req.body;
    if (codigo !== undefined) descuento.codigo = codigo;
    if (porcentaje !== undefined) descuento.porcentaje = porcentaje;
    if (monto_fijo !== undefined) descuento.monto_fijo = monto_fijo;
    if (activo !== undefined) descuento.activo = !!activo;

    await descuento.save();
    res.json({ message: "Descuento actualizado", descuento });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar descuento", error: err.message || err });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ message: "Descuento no encontrado" });
    await descuento.destroy();
    res.json({ message: "Descuento eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar descuento", error: err.message || err });
  }
};
