const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre_producto: { type: DataTypes.STRING(255), allowNull: false },
  imagen: { type: DataTypes.STRING(255), allowNull: false },
  precio: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
  categoria_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: 'producto',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Producto;
