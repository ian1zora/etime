require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const configRoutes = require('./routes/configRoutes');
const discountRoutes = require('./routes/discountRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares de seguridad
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', configRoutes);
app.use('/api/discounts', discountRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('../client/assets'));
app.use('/src', express.static('../client/src'));
app.use(express.static('../client/dist'));

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Servir checkout y confirmation desde public
app.get('/checkout.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/checkout.html'));
});

app.get('/confirmation.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/confirmation.html'));
});

// Servir la aplicación React
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ETime Restaurant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      categories: '/api/categories',
      settings: '/api/settings',
      discounts: '/api/discounts'
    }
  });
});

// Middleware de manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos MySQL');
    
    // Sincronización desactivada - usando BD existente
    console.log('✅ Usando base de datos existente');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ETime corriendo en puerto ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;