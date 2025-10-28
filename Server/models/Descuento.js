const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Descuento = sequelize.define('Descuento', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  porcentaje: { type: DataTypes.DECIMAL(5,2) },
  monto_fijo: { type: DataTypes.DECIMAL(10,2) },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'descuento',
  timestamps: false
});

module.exports = Descuento;
