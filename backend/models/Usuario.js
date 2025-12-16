const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nombre_usuario: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  contrasena: { 
    type: DataTypes.STRING(255), 
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  email: { 
    type: DataTypes.STRING(255), 
    allowNull: false, 
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  rol: { 
    type: DataTypes.ENUM('cliente', 'admin'), 
    defaultValue: 'cliente',
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuario',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.contrasena) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 12);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena')) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 12);
      }
    }
  }
});

// Métodos de instancia
Usuario.prototype.validarContrasena = async function(contrasena) {
  return await bcrypt.compare(contrasena, this.contrasena);
};

Usuario.prototype.esAdmin = function() {
  return this.rol === 'admin';
};

Usuario.prototype.estaActivo = function() {
  return true; // Simplificado: siempre activo
};

Usuario.prototype.registrarAcceso = async function() {
  // No hace nada, la tabla no tiene estas columnas
};

Usuario.prototype.incrementarIntentos = async function() {
  // No hace nada, la tabla no tiene estas columnas
};

// Métodos estáticos
Usuario.buscarPorEmail = async function(email) {
  return await this.findOne({ 
    where: { email: email },
    attributes: { exclude: ['contrasena'] }
  });
};

Usuario.buscarParaLogin = async function(email) {
  return await this.findOne({ 
    where: { email: email }
  });
};

Usuario.obtenerAdministradores = async function() {
  return await this.findAll({
    where: { rol: 'admin' },
    attributes: { exclude: ['contrasena'] }
  });
};

module.exports = Usuario;