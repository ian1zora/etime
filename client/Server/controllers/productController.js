const { Producto, Categoria } = require('../models');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Producto.findAll({ include: Categoria });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { nombre_producto, imagen, precio, categoria_id } = req.body;
    const product = await Producto.create({ nombre_producto, imagen, precio, categoria_id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
