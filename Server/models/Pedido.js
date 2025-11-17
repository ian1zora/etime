const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  personas_mesa: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  impuestos: { type: DataTypes.DECIMAL(10,2) },
  descuento: { type: DataTypes.DECIMAL(10,2) },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  estado: { type: DataTypes.ENUM('pendiente','pagado','enviado','cancelado','completado'), defaultValue: 'pendiente' },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'pedido',
  timestamps: false
});

module.exports = Pedido;
