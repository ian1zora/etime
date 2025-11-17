const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  clave: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  valor: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'configuracion',
  timestamps: true,
  createdAt: false,
  updatedAt: 'actualizado_en'
});

module.exports = Configuracion;
