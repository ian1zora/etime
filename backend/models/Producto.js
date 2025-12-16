const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nombre_producto: { 
    type: DataTypes.STRING(255), 
    allowNull: false
  },
  imagen: { 
    type: DataTypes.STRING(500), 
    allowNull: false
  },
  precio: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false
  },
  disponible: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true,
    allowNull: false
  },
  categoria_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false
  }
}, {
  tableName: 'producto',
  timestamps: false
});

module.exports = Producto;