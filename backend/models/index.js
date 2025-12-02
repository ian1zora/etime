const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Pedido = require('./Pedido');
const PedidoItem = require('./PedidoItem');
const Descuento = require('./Descuento');
const Configuracion = require('./Configuracion');

// Definir todas las relaciones
function defineAssociations() {
  // Categoria - Producto
  Categoria.hasMany(Producto, { 
    foreignKey: 'categoria_id',
    as: 'productos',
    onDelete: 'RESTRICT'
  });
  Producto.belongsTo(Categoria, { 
    foreignKey: 'categoria_id',
    as: 'categoria'
  });

  // Usuario - Pedido
  Usuario.hasMany(Pedido, { 
    foreignKey: 'usuario_id',
    as: 'pedidos'
  });
  Pedido.belongsTo(Usuario, { 
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Pedido - PedidoItem
  Pedido.hasMany(PedidoItem, { 
    foreignKey: 'pedido_id',
    as: 'items'
  });
  PedidoItem.belongsTo(Pedido, { 
    foreignKey: 'pedido_id'
  });

  // Producto - PedidoItem
  Producto.hasMany(PedidoItem, { 
    foreignKey: 'producto_id',
    as: 'pedidoItems'
  });
  PedidoItem.belongsTo(Producto, { 
    foreignKey: 'producto_id',
    as: 'producto'
  });
}

// Ejecutar las asociaciones
defineAssociations();

// Función para sincronizar la base de datos
async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options);
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
}

// Función para ejecutar stored procedures
async function executeStoredProcedure(procedureName, params = []) {
  try {
    const result = await sequelize.query(
      `CALL ${procedureName}(${params.map(() => '?').join(',')})`,
      {
        replacements: params,
        type: sequelize.QueryTypes.RAW
      }
    );
    return result;
  } catch (error) {
    console.error(`❌ Error ejecutando stored procedure ${procedureName}:`, error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Producto,
  Pedido,
  PedidoItem,
  Descuento,
  Configuracion,
  syncDatabase,
  executeStoredProcedure
};