const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  clave: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  valor: { 
    type: DataTypes.STRING(500), 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'general'
  },
  es_publica: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si la configuración puede ser vista por usuarios no admin'
  },
  valor_por_defecto: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  validacion_regex: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  min_valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  max_valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'configuracion',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      unique: true,
      fields: ['clave']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['es_publica']
    }
  ],
  hooks: {
    beforeSave: (config) => {
      // Validar valor según tipo
      if (config.tipo === 'number') {
        const numero = parseFloat(config.valor);
        if (isNaN(numero)) {
          throw new Error('El valor debe ser un número válido');
        }
        
        if (config.min_valor !== null && numero < config.min_valor) {
          throw new Error(`El valor debe ser mayor o igual a ${config.min_valor}`);
        }
        
        if (config.max_valor !== null && numero > config.max_valor) {
          throw new Error(`El valor debe ser menor o igual a ${config.max_valor}`);
        }
      }
      
      if (config.tipo === 'boolean') {
        const valorLower = config.valor.toLowerCase();
        if (!['true', 'false', '1', '0'].includes(valorLower)) {
          throw new Error('El valor booleano debe ser true, false, 1 o 0');
        }
      }
      
      if (config.tipo === 'json') {
        try {
          JSON.parse(config.valor);
        } catch (error) {
          throw new Error('El valor debe ser un JSON válido');
        }
      }
      
      // Validar con regex si existe
      if (config.validacion_regex) {
        const regex = new RegExp(config.validacion_regex);
        if (!regex.test(config.valor)) {
          throw new Error('El valor no cumple con el formato requerido');
        }
      }
    }
  }
});

// Métodos estáticos
Configuracion.obtenerValor = async function(clave, valorPorDefecto = null) {
  try {
    const config = await this.findOne({ where: { clave } });
    
    if (!config) {
      return valorPorDefecto;
    }
    
    // Convertir según el tipo
    switch (config.tipo) {
      case 'number':
        return parseFloat(config.valor);
      case 'boolean':
        return ['true', '1'].includes(config.valor.toLowerCase());
      case 'json':
        return JSON.parse(config.valor);
      default:
        return config.valor;
    }
  } catch (error) {
    console.error(`Error obteniendo configuración ${clave}:`, error);
    return valorPorDefecto;
  }
};

Configuracion.establecerValor = async function(clave, valor, descripcion = null) {
  try {
    const [config, created] = await this.findOrCreate({
      where: { clave },
      defaults: {
        clave,
        valor: String(valor),
        descripcion,
        tipo: this.detectarTipo(valor)
      }
    });
    
    if (!created) {
      config.valor = String(valor);
      if (descripcion) {
        config.descripcion = descripcion;
      }
      await config.save();
    }
    
    return config;
  } catch (error) {
    console.error(`Error estableciendo configuración ${clave}:`, error);
    throw error;
  }
};

Configuracion.obtenerPorCategoria = async function(categoria) {
  return await this.findAll({
    where: { categoria },
    order: [['clave', 'ASC']]
  });
};

Configuracion.obtenerPublicas = async function() {
  return await this.findAll({
    where: { es_publica: true },
    attributes: ['clave', 'valor', 'descripcion', 'tipo'],
    order: [['categoria', 'ASC'], ['clave', 'ASC']]
  });
};

Configuracion.detectarTipo = function(valor) {
  if (typeof valor === 'boolean') return 'boolean';
  if (typeof valor === 'number') return 'number';
  if (typeof valor === 'object') return 'json';
  return 'string';
};

Configuracion.inicializarConfiguracionesBasicas = async function() {
  const configuracionesBasicas = [
    {
      clave: 'max_items_per_person',
      valor: '4',
      descripcion: 'Máximo número de items por persona en un pedido',
      tipo: 'number',
      categoria: 'pedidos',
      es_publica: true,
      min_valor: 1,
      max_valor: 20
    },
    {
      clave: 'tasa_impuesto',
      valor: '21.00',
      descripcion: 'Tasa de impuesto en porcentaje',
      tipo: 'number',
      categoria: 'facturacion',
      es_publica: true,
      min_valor: 0,
      max_valor: 100
    },
    {
      clave: 'moneda',
      valor: 'ARS',
      descripcion: 'Moneda utilizada en el sistema',
      tipo: 'string',
      categoria: 'general',
      es_publica: true
    },
    {
      clave: 'tiempo_preparacion_promedio',
      valor: '30',
      descripcion: 'Tiempo promedio de preparación en minutos',
      tipo: 'number',
      categoria: 'cocina',
      es_publica: true,
      min_valor: 5,
      max_valor: 180
    },
    {
      clave: 'horario_apertura',
      valor: '11:00',
      descripcion: 'Horario de apertura del restaurante',
      tipo: 'string',
      categoria: 'horarios',
      es_publica: true,
      validacion_regex: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    {
      clave: 'horario_cierre',
      valor: '23:00',
      descripcion: 'Horario de cierre del restaurante',
      tipo: 'string',
      categoria: 'horarios',
      es_publica: true,
      validacion_regex: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    {
      clave: 'nombre_restaurante',
      valor: 'ETime Restaurant',
      descripcion: 'Nombre del restaurante',
      tipo: 'string',
      categoria: 'general',
      es_publica: true
    },
    {
      clave: 'direccion_restaurante',
      valor: 'Av. Principal 123, Ciudad',
      descripcion: 'Dirección del restaurante',
      tipo: 'string',
      categoria: 'general',
      es_publica: true
    },
    {
      clave: 'telefono_restaurante',
      valor: '+54 11 1234-5678',
      descripcion: 'Teléfono del restaurante',
      tipo: 'string',
      categoria: 'general',
      es_publica: true
    },
    {
      clave: 'email_contacto',
      valor: 'contacto@etime.com',
      descripcion: 'Email de contacto del restaurante',
      tipo: 'string',
      categoria: 'general',
      es_publica: true,
      validacion_regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    },
    {
      clave: 'capacidad_maxima_mesa',
      valor: '8',
      descripcion: 'Capacidad máxima de personas por mesa',
      tipo: 'number',
      categoria: 'pedidos',
      es_publica: true,
      min_valor: 1,
      max_valor: 20
    },
    {
      clave: 'descuento_maximo_porcentaje',
      valor: '50',
      descripcion: 'Porcentaje máximo de descuento permitido',
      tipo: 'number',
      categoria: 'descuentos',
      es_publica: false,
      min_valor: 0,
      max_valor: 100
    },
    {
      clave: 'notificaciones_email',
      valor: 'true',
      descripcion: 'Enviar notificaciones por email',
      tipo: 'boolean',
      categoria: 'notificaciones',
      es_publica: false
    },
    {
      clave: 'modo_mantenimiento',
      valor: 'false',
      descripcion: 'Activar modo de mantenimiento',
      tipo: 'boolean',
      categoria: 'sistema',
      es_publica: true
    }
  ];
  
  for (const config of configuracionesBasicas) {
    await this.findOrCreate({
      where: { clave: config.clave },
      defaults: config
    });
  }
  
  console.log('✅ Configuraciones básicas inicializadas');
};

// Métodos de instancia
Configuracion.prototype.obtenerValorTipado = function() {
  switch (this.tipo) {
    case 'number':
      return parseFloat(this.valor);
    case 'boolean':
      return ['true', '1'].includes(this.valor.toLowerCase());
    case 'json':
      return JSON.parse(this.valor);
    default:
      return this.valor;
  }
};

Configuracion.prototype.validarValor = function(nuevoValor) {
  const valor = String(nuevoValor);
  
  if (this.tipo === 'number') {
    const numero = parseFloat(valor);
    if (isNaN(numero)) {
      throw new Error('El valor debe ser un número válido');
    }
    
    if (this.min_valor !== null && numero < this.min_valor) {
      throw new Error(`El valor debe ser mayor o igual a ${this.min_valor}`);
    }
    
    if (this.max_valor !== null && numero > this.max_valor) {
      throw new Error(`El valor debe ser menor o igual a ${this.max_valor}`);
    }
  }
  
  if (this.validacion_regex) {
    const regex = new RegExp(this.validacion_regex);
    if (!regex.test(valor)) {
      throw new Error('El valor no cumple con el formato requerido');
    }
  }
  
  return true;
};

module.exports = Configuracion;