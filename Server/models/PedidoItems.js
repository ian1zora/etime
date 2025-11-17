const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PedidoItem = sequelize.define('PedidoItem', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  pedido_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  producto_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  nombre_producto: { type: DataTypes.STRING(255), allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'pedido_item',
  timestamps: false
});

module.exports = PedidoItem;
