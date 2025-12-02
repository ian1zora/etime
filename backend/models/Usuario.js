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
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  intentos_login: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuario',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['rol']
    },
    {
      fields: ['activo']
    }
  ],
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
  return this.activo && (!this.bloqueado_hasta || this.bloqueado_hasta < new Date());
};

Usuario.prototype.bloquearUsuario = async function(minutos = 30) {
  this.bloqueado_hasta = new Date(Date.now() + minutos * 60 * 1000);
  this.intentos_login = 0;
  await this.save();
};

Usuario.prototype.registrarAcceso = async function() {
  this.ultimo_acceso = new Date();
  this.intentos_login = 0;
  this.bloqueado_hasta = null;
  await this.save();
};

Usuario.prototype.incrementarIntentos = async function() {
  this.intentos_login += 1;
  if (this.intentos_login >= 5) {
    await this.bloquearUsuario();
  } else {
    await this.save();
  }
};

// Métodos estáticos
Usuario.buscarPorEmail = async function(email) {
  return await this.findOne({ 
    where: { email, activo: true },
    attributes: { exclude: ['contrasena'] }
  });
};

Usuario.buscarParaLogin = async function(email) {
  return await this.findOne({ 
    where: { email, activo: true }
  });
};

Usuario.obtenerAdministradores = async function() {
  return await this.findAll({
    where: { rol: 'admin', activo: true },
    attributes: { exclude: ['contrasena'] }
  });
};

module.exports = Usuario;