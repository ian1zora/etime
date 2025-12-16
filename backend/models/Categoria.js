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
    allowNull: false
  }
}, {
  tableName: 'categoria',
  timestamps: false
});

// Métodos estáticos
Categoria.obtenerActivas = async function() {
  return await this.findAll({
    order: [['nombre', 'ASC']]
  });
};

Categoria.obtenerConProductos = async function() {
  const Producto = require('./Producto');
  return await this.findAll({
    include: [{
      model: Producto,
      as: 'productos',
      where: { disponible: true },
      required: false
    }],
    order: [['nombre', 'ASC']]
  });
};

Categoria.buscarPorNombre = async function(nombre) {
  return await this.findOne({
    where: { nombre }
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