const { Producto, Categoria } = require('../models');

// Listar todos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Producto.findAll({ include: Categoria });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener por ID
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Producto.findByPk(id, { include: Categoria });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Listar por categoría
exports.getProductsByCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const products = await Producto.findAll({ where: { categoria_id: catId } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear producto
exports.createProduct = async (req, res) => {
  try {
    const { nombre_producto, imagen, precio, categoria_id } = req.body;
    // validaciones básicas
    if (!nombre_producto || !precio) return res.status(400).json({ message: 'Datos incompletos' });
    const product = await Producto.create({ nombre_producto, imagen, precio, categoria_id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Producto.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const { nombre_producto, imagen, precio, categoria_id } = req.body;
    product.nombre_producto = nombre_producto ?? product.nombre_producto;
    product.imagen = imagen ?? product.imagen;
    product.precio = precio ?? product.precio;
    product.categoria_id = categoria_id ?? product.categoria_id;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Producto.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
