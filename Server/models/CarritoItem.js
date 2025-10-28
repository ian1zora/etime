const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarritoItem = sequelize.define('CarritoItem', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  carrito_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  producto_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'carrito_item',
  timestamps: false
});

module.exports = CarritoItem;
