const { Pedido, PedidoItems, Producto, Descuento, Configuracion } = require('../models');

// Crear nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mesa, personas, items, descuentoCodigo } = req.body;

    if (!personas || personas <= 0) {
      return res.status(400).json({ message: "Debe indicar el número de personas por mesa." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos un producto en el pedido." });
    }

    // Límite: 4 artículos por comensal
    const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
    const maxItems = personas * 4;
    if (totalItems > maxItems) {
      return res.status(400).json({
        message: `El pedido excede el límite de ${maxItems} artículos (${personas} personas × 4).`
      });
    }

    // Obtener precios actuales de productos
    const productIds = items.map(i => i.productoId);
    const productos = await Producto.findAll({ where: { id: productIds } });

    // Calcular subtotal
    let subtotal = 0;
    for (const item of items) {
      const producto = productos.find(p => p.id === item.productoId);
      if (!producto) {
        return res.status(400).json({ message: `Producto con id ${item.productoId} no encontrado.` });
      }
      subtotal += producto.precio * item.cantidad;
    }

    // Aplicar descuento si corresponde
    let descuento = null;
    let total = subtotal;
    if (descuentoCodigo) {
      descuento = await Descuento.findOne({ where: { codigo: descuentoCodigo, activo: true } });
      if (descuento) {
        total = subtotal - (subtotal * descuento.porcentaje / 100);
      }
    }

    // Crear pedido
    const pedido = await Pedido.create({
      usuarioId: userId,
      mesa,
      personas,
      subtotal,
      total,
      descuentoId: descuento ? descuento.id : null,
      estado: 'pendiente'
    });

    // Crear items del pedido
    const itemsGuardados = await Promise.all(items.map(async (i) => {
      const producto = productos.find(p => p.id === i.productoId);
      return PedidoItems.create({
        pedidoId: pedido.id,
        productoId: producto.id,
        cantidad: i.cantidad,
        precioUnitario: producto.precio
      });
    }));

    res.status(201).json({
      message: "✅ Pedido creado correctamente",
      pedido: {
        ...pedido.toJSON(),
        items: itemsGuardados
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el pedido", error: error.message });
  }
};

// Listar pedidos del usuario
exports.getOrdersForUser = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuarioId: req.user.id },
      include: [{ model: PedidoItems, include: [Producto] }]
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error });
  }
};

// Obtener un pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{ model: PedidoItems, include: [Producto] }]
    });
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedido", error });
  }
};

// Admin: listar todos los pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [{ model: PedidoItems, include: [Producto] }]
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: "Error al listar pedidos", error });
  }
};

// Admin: actualizar estado del pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    pedido.estado = req.body.estado || pedido.estado;
    await pedido.save();

    res.json({ message: "Estado de pedido actualizado", pedido });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado", error });
  }
};
