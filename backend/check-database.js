require('dotenv').config();
const { sequelize } = require('./config/database');
const { Producto, Categoria } = require('./models');

async function checkDatabase() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Verificar si existen las tablas
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tablas encontradas:', results.map(r => Object.values(r)[0]));
    
    // Verificar productos
    const productos = await Producto.findAll();
    console.log(`📦 Productos encontrados: ${productos.length}`);
    
    if (productos.length > 0) {
      console.log('🍽️ Primeros 3 productos:');
      productos.slice(0, 3).forEach(p => {
        console.log(`  - ${p.nombre_producto}: $${p.precio}`);
      });
    }
    
    // Verificar categorías
    const categorias = await Categoria.findAll();
    console.log(`📂 Categorías encontradas: ${categorias.length}`);
    
    if (categorias.length > 0) {
      console.log('📂 Categorías:');
      categorias.forEach(c => {
        console.log(`  - ${c.nombre}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.original && error.original.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 La base de datos no existe. Ejecuta el schema.sql primero.');
    }
  } finally {
    await sequelize.close();
  }
}

checkDatabase();