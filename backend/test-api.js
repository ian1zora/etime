require('dotenv').config();
const { Categoria, Producto } = require('./models');

async function testAPI() {
  try {
    console.log('🧪 Probando categorías...');
    const categorias = await Categoria.findAll({
      order: [['nombre', 'ASC']]
    });
    console.log('✅ Categorías:', categorias.map(c => ({ id: c.id, nombre: c.nombre })));
    
    console.log('\n🧪 Probando productos...');
    const productos = await Producto.findAll({
      where: { disponible: true },
      order: [['categoria_id', 'ASC'], ['nombre_producto', 'ASC']]
    });
    console.log('✅ Productos:', productos.length);
    productos.slice(0, 3).forEach(p => {
      console.log(`  - ${p.nombre_producto}: $${p.precio} (Cat: ${p.categoria_id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

testAPI();