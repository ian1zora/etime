const { Pedido, PedidoItem, Producto, Usuario, Descuento, executeStoredProcedure } = require('../models');
const { validationResult } = require('express-validator');

class OrderController {
  // Crear un nuevo pedido usando stored procedure
  static async crearPedido(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { personas_mesa, items, codigo_descuento, notas, mesa_numero } = req.body;
      const usuario_id = req.user.id;

      // Validar que hay items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El pedido debe tener al menos un item'
        });
      }

      // Validar disponibilidad de productos
      const erroresDisponibilidad = await PedidoItem.validarDisponibilidad(items);
      if (erroresDisponibilidad.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Productos no disponibles',
          errors: erroresDisponibilidad
        });
      }

      // Usar stored procedure para crear el pedido
      const itemsJson = JSON.stringify(items);
      const result = await executeStoredProcedure('crear_pedido', [
        usuario_id,
        personas_mesa,
        itemsJson,
        codigo_descuento || null
      ]);

      if (!result || result.length === 0) {
        throw new Error('Error en el stored procedure');
      }

      const pedidoId = result[0][0].pedido_id;
      const mensaje = result[0][0].mensaje;

      if (!pedidoId) {
        return res.status(400).json({
          success: false,
          message: mensaje || 'Error al crear el pedido'
        });
      }

      // Obtener el pedido completo creado
      const pedidoCompleto = await Pedido.buscarPorId(pedidoId);

      // Actualizar campos adicionales si se proporcionan
      if (notas || mesa_numero) {
        await Pedido.update(
          { 
            notas: notas || null,
            mesa_numero: mesa_numero || null
          },
          { where: { id: pedidoId } }
        );
      }

      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: {
          pedido: pedidoCompleto,
          mensaje_sp: mensaje
        }
      });

    } catch (error) {
      console.error('Error creando pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener pedidos con filtros
  static async obtenerPedidos(req, res) {
    try {
      const { 
        estado, 
        usuario_id, 
        fecha_inicio, 
        fecha_fin, 
        page = 1, 
        limit = 10,
        numero_pedido 
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Aplicar filtros
      if (estado) whereClause.estado = estado;
      if (usuario_id) whereClause.usuario_id = usuario_id;
      if (numero_pedido) whereClause.numero_pedido = numero_pedido;
      
      if (fecha_inicio && fecha_fin) {
        whereClause.fecha_pedido = {
          [require('sequelize').Op.between]: [fecha_inicio, fecha_fin]
        };
      }

      // Si no es admin, solo puede ver sus propios pedidos
      if (req.user.rol !== 'admin') {
        whereClause.usuario_id = req.user.id;
      }

      const { count, rows } = await Pedido.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre_usuario', 'email']
          },
          {
            model: PedidoItem,
            as: 'items',
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre_producto', 'imagen']
            }]
          }
        ],
        order: [['fecha_pedido', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          pedidos: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener pedido por ID
  static async obtenerPedidoPorId(req, res) {
    try {
      const { id } = req.params;
      
      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre_usuario', 'email']
          },
          {
            model: PedidoItem,
            as: 'items',
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre_producto', 'imagen', 'precio', 'descripcion']
            }]
          }
        ]
      });

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.rol !== 'admin' && pedido.usuario_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este pedido'
        });
      }

      res.json({
        success: true,
        data: { pedido }
      });

    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar estado del pedido usando stored procedure
  static async actualizarEstado(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { estado } = req.body;
      const usuario_id = req.user.id;

      // Solo admins pueden cambiar estados
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar pedidos'
        });
      }

      // Usar stored procedure para actualizar estado
      const result = await executeStoredProcedure('actualizar_estado_pedido', [
        id,
        estado,
        usuario_id
      ]);

      const mensaje = result[0][0].mensaje;

      if (mensaje.includes('Error')) {
        return res.status(400).json({
          success: false,
          message: mensaje
        });
      }

      // Obtener pedido actualizado
      const pedidoActualizado = await Pedido.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre_usuario', 'email']
          },
          {
            model: PedidoItem,
            as: 'items',
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre_producto', 'imagen']
            }]
          }
        ]
      });

      res.json({
        success: true,
        message: mensaje,
        data: { pedido: pedidoActualizado }
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cancelar pedido
  static async cancelarPedido(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.rol !== 'admin' && pedido.usuario_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar este pedido'
        });
      }

      // Verificar si se puede cancelar
      if (!pedido.puedeSerCancelado()) {
        return res.status(400).json({
          success: false,
          message: 'Este pedido no puede ser cancelado en su estado actual'
        });
      }

      // Actualizar estado y agregar motivo en notas
      await pedido.update({
        estado: 'cancelado',
        notas: pedido.notas ? 
          `${pedido.notas}\n\nCANCELADO: ${motivo || 'Sin motivo especificado'}` :
          `CANCELADO: ${motivo || 'Sin motivo especificado'}`
      });

      res.json({
        success: true,
        message: 'Pedido cancelado exitosamente',
        data: { pedido }
      });

    } catch (error) {
      console.error('Error cancelando pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de pedidos
  static async obtenerEstadisticas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren fecha_inicio y fecha_fin'
        });
      }

      // Solo admins pueden ver estadísticas
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estadísticas'
        });
      }

      // Usar stored procedure para obtener estadísticas
      const estadisticas = await executeStoredProcedure('obtener_estadisticas_ventas', [
        fecha_inicio,
        fecha_fin
      ]);

      // Obtener estadísticas adicionales
      const estadisticasAdicionales = await Pedido.obtenerEstadisticasVentas(fecha_inicio, fecha_fin);

      res.json({
        success: true,
        data: {
          estadisticas_diarias: estadisticas[0] || [],
          resumen: estadisticasAdicionales
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener pedidos por estado (para dashboard)
  static async obtenerPorEstado(req, res) {
    try {
      const { estado } = req.params;

      // Solo admins pueden ver todos los pedidos por estado
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para esta operación'
        });
      }

      const pedidos = await Pedido.obtenerPorEstado(estado);

      res.json({
        success: true,
        data: { pedidos }
      });

    } catch (error) {
      console.error('Error obteniendo pedidos por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Validar código de descuento
  static async validarDescuento(req, res) {
    try {
      const { codigo, subtotal } = req.body;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código de descuento requerido'
        });
      }

      const validacion = await Descuento.validarCodigo(codigo, req.user.id, subtotal || 0);

      if (!validacion.valido) {
        return res.status(400).json({
          success: false,
          message: validacion.mensaje
        });
      }

      const descuento = await Descuento.buscarPorCodigo(codigo);
      const montoDescuento = descuento.calcularDescuento(subtotal || 0);

      res.json({
        success: true,
        message: 'Código válido',
        data: {
          codigo: descuento.codigo,
          nombre: descuento.nombre,
          tipo: descuento.tipo,
          valor: descuento.valor,
          monto_descuento: montoDescuento,
          subtotal_con_descuento: (subtotal || 0) - montoDescuento
        }
      });

    } catch (error) {
      console.error('Error validando descuento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = OrderController;