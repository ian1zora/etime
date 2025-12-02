const express = require('express');
const { Pedido, PedidoItem, Producto, Usuario } = require('../models');
const router = express.Router();

// Crear nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { customer, shipping, payment, order } = req.body;
    
    // Generar número de pedido único
    const numeroPedido = `PED-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Calcular totales
    let subtotal = 0;
    for (const item of order.items) {
      subtotal += item.precio_unitario * item.cantidad;
    }
    
    const descuentoPorcentaje = order.codigo_descuento ? 10 : 0; // Simplificado
    const descuento = subtotal * (descuentoPorcentaje / 100);
    const impuestos = (subtotal - descuento) * 0.21;
    const total = subtotal - descuento + impuestos;
    
    // Crear pedido
    const nuevoPedido = await Pedido.create({
      usuario_id: 1, // Usuario por defecto
      numero_pedido: numeroPedido,
      personas_mesa: order.personas_mesa || 1,
      subtotal: subtotal,
      impuestos: impuestos,
      descuento: descuento,
      total: total,
      estado: 'pendiente',
      notas: `Cliente: ${customer.firstName} ${customer.lastName}\nEmail: ${customer.email}\nTeléfono: ${customer.phone}\nDirección: ${shipping.address}, ${shipping.city}\nPago: ${payment.method}\n${shipping.notes ? 'Notas: ' + shipping.notes : ''}`
    });
    
    // Crear items del pedido
    for (const item of order.items) {
      const producto = await Producto.findByPk(item.producto_id);
      await PedidoItem.create({
        pedido_id: nuevoPedido.id,
        producto_id: item.producto_id,
        nombre_producto: producto.nombre_producto,
        precio_unitario: item.precio_unitario,
        cantidad: item.cantidad,
        subtotal: item.precio_unitario * item.cantidad
      });
      
      // Reducir stock
      if (producto.stock >= item.cantidad) {
        await producto.update({ stock: producto.stock - item.cantidad });
      }
    }
    
    res.json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        id: nuevoPedido.id,
        numero_pedido: numeroPedido,
        total: total,
        estado: 'pendiente'
      }
    });
    
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el pedido'
    });
  }
});

// Obtener pedido por número
router.get('/:numeroPedido', async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      where: { numero_pedido: req.params.numeroPedido },
      include: [{
        model: PedidoItem,
        as: 'items'
      }]
    });
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: pedido
    });
    
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedido'
    });
  }
});

module.exports = router;