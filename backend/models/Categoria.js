const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nombre: { 
    type: DataTypes.STRING(255), 
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 255],
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  orden_display: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'categoria',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['orden_display']
    }
  ]
});

// Métodos estáticos
Categoria.obtenerActivas = async function() {
  return await this.findAll({
    where: { activo: true },
    order: [['orden_display', 'ASC'], ['nombre', 'ASC']]
  });
};

Categoria.obtenerConProductos = async function() {
  const Producto = require('./Producto');
  return await this.findAll({
    where: { activo: true },
    include: [{
      model: Producto,
      as: 'productos',
      where: { disponible: true },
      required: false
    }],
    order: [['orden_display', 'ASC'], ['nombre', 'ASC']]
  });
};

Categoria.buscarPorNombre = async function(nombre) {
  return await this.findOne({
    where: { nombre, activo: true }
  });
};

// Métodos de instancia
Categoria.prototype.tieneProductos = async function() {
  const Producto = require('./Producto');
  const count = await Producto.count({
    where: { categoria_id: this.id }
  });
  return count > 0;
};

Categoria.prototype.contarProductosDisponibles = async function() {
  const Producto = require('./Producto');
  return await Producto.count({
    where: { 
      categoria_id: this.id,
      disponible: true
    }
  });
};

module.exports = Categoria;