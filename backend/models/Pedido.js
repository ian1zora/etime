const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  usuario_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false
  },
  numero_pedido: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  personas_mesa: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1,
    allowNull: false
  },
  subtotal: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00,
    allowNull: false
  },
  impuestos: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00,
    allowNull: false
  },
  descuento: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00,
    allowNull: false
  },
  total: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00,
    allowNull: false
  },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'), 
    defaultValue: 'pendiente',
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pedido',
  timestamps: false
});

module.exports = Pedido;