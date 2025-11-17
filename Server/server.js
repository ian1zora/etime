require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const configRoutes = require('./routes/configRoutes');
const errorHandler = require('./middlewares/errorHandler');
const discountRoutes = require('./routes/discountRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// prefijo API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', configRoutes);
app.use('/api/discounts', discountRoutes);


// endpoint de prueba
app.get('/', (req, res) => res.json({ ok: true, version: 'backend' }));

// middleware global de manejo de errores (debe ir después de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Conexión DB y arranque del servidor
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a la base de datos MySQL');
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión DB:', err));

  sequelize.sync({ alter: true })  
  .then(() => {
    console.log('✅ Tablas sincronizadas con la base de datos');
  })
  .catch(err => console.error('❌ Error al sincronizar tablas:', err));
