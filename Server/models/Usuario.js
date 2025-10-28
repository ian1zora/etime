const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre_usuario: { type: DataTypes.STRING(100), allowNull: false },
  contrasena: { type: DataTypes.STRING(255), allowNull: false },
  gmail: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  rol: { type: DataTypes.ENUM('cliente', 'admin'), defaultValue: 'cliente' },
}, {
  tableName: 'usuario',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Usuario;
