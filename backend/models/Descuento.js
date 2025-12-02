const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Descuento = sequelize.define('Descuento', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  codigo: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true,
      isUppercase: true
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100],
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('porcentaje', 'monto_fijo'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  monto_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  monto_maximo_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  usos_maximos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  usos_actuales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  usos_por_usuario: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  solo_primera_compra: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  categorias_aplicables: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de IDs de categorías donde aplica el descuento'
  },
  productos_excluidos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de IDs de productos excluidos del descuento'
  }
}, {
  tableName: 'descuento',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['fecha_inicio', 'fecha_fin']
    },
    {
      fields: ['tipo']
    }
  ],
  hooks: {
    beforeSave: (descuento) => {
      // Convertir código a mayúsculas
      if (descuento.codigo) {
        descuento.codigo = descuento.codigo.toUpperCase();
      }
      
      // Validar fechas
      if (descuento.fecha_inicio && descuento.fecha_fin) {
        if (descuento.fecha_inicio >= descuento.fecha_fin) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }
      }
      
      // Validar valor según tipo
      if (descuento.tipo === 'porcentaje' && descuento.valor > 100) {
        throw new Error('El porcentaje no puede ser mayor a 100');
      }
    }
  }
});

// Métodos estáticos
Descuento.buscarPorCodigo = async function(codigo) {
  return await this.findOne({
    where: { 
      codigo: codigo.toUpperCase(),
      activo: true
    }
  });
};

Descuento.obtenerActivos = async function() {
  const ahora = new Date();
  return await this.findAll({
    where: {
      activo: true,
      [sequelize.Op.or]: [
        { fecha_inicio: null },
        { fecha_inicio: { [sequelize.Op.lte]: ahora } }
      ],
      [sequelize.Op.or]: [
        { fecha_fin: null },
        { fecha_fin: { [sequelize.Op.gte]: ahora } }
      ],
      [sequelize.Op.or]: [
        { usos_maximos: null },
        { usos_actuales: { [sequelize.Op.lt]: sequelize.col('usos_maximos') } }
      ]
    },
    order: [['fecha_creacion', 'DESC']]
  });
};

Descuento.validarCodigo = async function(codigo, usuarioId = null, subtotal = 0) {
  const descuento = await this.buscarPorCodigo(codigo);
  
  if (!descuento) {
    return { valido: false, mensaje: 'Código de descuento no válido' };
  }
  
  const validacion = await descuento.esValido(usuarioId, subtotal);
  return validacion;
};

Descuento.obtenerPorCategoria = async function(categoriaId) {
  const ahora = new Date();
  return await this.findAll({
    where: {
      activo: true,
      [sequelize.Op.or]: [
        { categorias_aplicables: null },
        { categorias_aplicables: { [sequelize.Op.contains]: [categoriaId] } }
      ],
      [sequelize.Op.or]: [
        { fecha_inicio: null },
        { fecha_inicio: { [sequelize.Op.lte]: ahora } }
      ],
      [sequelize.Op.or]: [
        { fecha_fin: null },
        { fecha_fin: { [sequelize.Op.gte]: ahora } }
      ]
    }
  });
};

// Métodos de instancia
Descuento.prototype.esValido = async function(usuarioId = null, subtotal = 0) {
  const ahora = new Date();
  
  // Verificar si está activo
  if (!this.activo) {
    return { valido: false, mensaje: 'El descuento no está activo' };
  }
  
  // Verificar fechas
  if (this.fecha_inicio && ahora < this.fecha_inicio) {
    return { valido: false, mensaje: 'El descuento aún no está disponible' };
  }
  
  if (this.fecha_fin && ahora > this.fecha_fin) {
    return { valido: false, mensaje: 'El descuento ha expirado' };
  }
  
  // Verificar usos máximos
  if (this.usos_maximos && this.usos_actuales >= this.usos_maximos) {
    return { valido: false, mensaje: 'El descuento ha alcanzado su límite de usos' };
  }
  
  // Verificar monto mínimo
  if (subtotal < this.monto_minimo) {
    return { 
      valido: false, 
      mensaje: `El monto mínimo para este descuento es $${this.monto_minimo}` 
    };
  }
  
  // Verificar usos por usuario
  if (usuarioId && this.usos_por_usuario) {
    const usosUsuario = await this.contarUsosPorUsuario(usuarioId);
    if (usosUsuario >= this.usos_por_usuario) {
      return { valido: false, mensaje: 'Ya has usado este descuento el máximo de veces permitido' };
    }
  }
  
  // Verificar si es solo para primera compra
  if (this.solo_primera_compra && usuarioId) {
    const tienePedidosAnteriores = await this.usuarioTienePedidosAnteriores(usuarioId);
    if (tienePedidosAnteriores) {
      return { valido: false, mensaje: 'Este descuento es solo para nuevos clientes' };
    }
  }
  
  return { valido: true, mensaje: 'Descuento válido' };
};

Descuento.prototype.calcularDescuento = function(subtotal) {
  let descuento = 0;
  
  if (this.tipo === 'porcentaje') {
    descuento = subtotal * (this.valor / 100);
  } else {
    descuento = this.valor;
  }
  
  // Aplicar límite máximo si existe
  if (this.monto_maximo_descuento && descuento > this.monto_maximo_descuento) {
    descuento = this.monto_maximo_descuento;
  }
  
  // No permitir descuento mayor al subtotal
  if (descuento > subtotal) {
    descuento = subtotal;
  }
  
  return Math.round(descuento * 100) / 100; // Redondear a 2 decimales
};

Descuento.prototype.aplicarDescuento = async function(subtotal, usuarioId = null) {
  const validacion = await this.esValido(usuarioId, subtotal);
  
  if (!validacion.valido) {
    throw new Error(validacion.mensaje);
  }
  
  const montoDescuento = this.calcularDescuento(subtotal);
  
  // Incrementar contador de usos
  await this.incrementarUsos();
  
  return {
    codigo: this.codigo,
    nombre: this.nombre,
    tipo: this.tipo,
    valor: this.valor,
    monto_descuento: montoDescuento,
    subtotal_original: subtotal,
    subtotal_con_descuento: subtotal - montoDescuento
  };
};

Descuento.prototype.incrementarUsos = async function() {
  this.usos_actuales += 1;
  await this.save();
};

Descuento.prototype.contarUsosPorUsuario = async function(usuarioId) {
  const Pedido = require('./Pedido');
  return await Pedido.count({
    where: {
      usuario_id: usuarioId,
      codigo_descuento: this.codigo,
      estado: { [sequelize.Op.ne]: 'cancelado' }
    }
  });
};

Descuento.prototype.usuarioTienePedidosAnteriores = async function(usuarioId) {
  const Pedido = require('./Pedido');
  const count = await Pedido.count({
    where: {
      usuario_id: usuarioId,
      estado: 'entregado'
    }
  });
  return count > 0;
};

Descuento.prototype.esAplicableAProducto = function(productoId, categoriaId) {
  // Si hay productos excluidos, verificar que no esté en la lista
  if (this.productos_excluidos && this.productos_excluidos.includes(productoId)) {
    return false;
  }
  
  // Si hay categorías específicas, verificar que la categoría esté incluida
  if (this.categorias_aplicables && this.categorias_aplicables.length > 0) {
    return this.categorias_aplicables.includes(categoriaId);
  }
  
  // Si no hay restricciones específicas, es aplicable
  return true;
};

module.exports = Descuento;