const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Carrito = require('./Carrito');
const CarritoItem = require('./CarritoItem');
const Pedido = require('./Pedido');
const PedidoItem = require('./PedidoItem');
const Descuento = require('./Descuento');
const Configuracion = require('./Configuracion');

// Relaciones
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Pedido.hasMany(PedidoItem, { foreignKey: 'pedido_id', onDelete: 'CASCADE' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedido_id' });

Producto.hasMany(PedidoItem, { foreignKey: 'producto_id' });
PedidoItem.belongsTo(Producto, { foreignKey: 'producto_id' });

Usuario.hasMany(Carrito, { foreignKey: 'usuario_id' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Carrito.hasMany(CarritoItem, { foreignKey: 'carrito_id', onDelete: 'CASCADE' });
CarritoItem.belongsTo(Carrito, { foreignKey: 'carrito_id' });

Producto.hasMany(CarritoItem, { foreignKey: 'producto_id' });
CarritoItem.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Producto,
  Carrito,
  CarritoItem,
  Pedido,
  PedidoItem,
  Descuento,
  Configuracion
};
