require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Categoria, Producto } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de categorías
app.get('/api/categories', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Error categorías:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo categorías' });
  }
});

// Endpoint de productos
app.get('/api/products', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [['categoria_id', 'ASC'], ['nombre_producto', 'ASC']]
    });
    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error productos:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo productos' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor simple corriendo en puerto ${PORT}`);
});