// Server/controllers/orderController.js
const { Pedido, PedidoItem, Producto, Descuento, Configuracion, sequelize } = require('../models');

// Crear nuevo pedido
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado." });

    const { mesa, personas, items, descuentoCodigo } = req.body;

    // Validaciones básicas
    if (!personas || Number(personas) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Debe indicar el número de personas por mesa." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Debe incluir al menos un producto en el pedido." });
    }

    // Calcular subtotal y validar productos
    let subtotal = 0.0;
    const itemsToCreate = [];

    for (const it of items) {
      // Se espera cada item: { producto_id, cantidad }
      const productoId = it.producto_id || it.id || it.productoId;
      const cantidad = Number(it.cantidad ?? it.qty ?? it.cantidad_producto);
      if (!productoId || !cantidad || cantidad <= 0) {
        await t.rollback();
        return res.status(400).json({ message: "Cada item debe tener producto_id y cantidad > 0." });
      }

      const producto = await Producto.findByPk(productoId, { transaction: t });
      if (!producto || producto.disponible === false) {
        await t.rollback();
        return res.status(404).json({ message: `Producto ${productoId} no encontrado o no disponible.` });
      }

      // Precio puede venir como string (DECIMAL en DB)
      const precio = Number(producto.precio);
      const linea = precio * cantidad;
      subtotal += linea;

      itemsToCreate.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre_producto,
        precio_unitario: precio,
        cantidad
      });
    }

    // Buscar impuesto configurado (porcentaje). Si no existe, 0%.
    let impuestoPercent = 0;
    try {
      const impuestoCfg = await Configuracion.findOne({ where: { clave: 'impuesto' }, transaction: t });
      if (impuestoCfg && impuestoCfg.valor) {
        const parsed = Number(impuestoCfg.valor);
        if (!isNaN(parsed)) impuestoPercent = parsed;
      }
    } catch (err) {
      // si falla la lectura, asumimos 0 pero no abortamos
      impuestoPercent = 0;
    }

    const impuestos = +(subtotal * (impuestoPercent / 100));
    let descuentoMonto = 0;

    // Aplicar descuento si se pasa un código
    if (descuentoCodigo) {
      const descuento = await Descuento.findOne({ where: { codigo: descuentoCodigo, activo: true }, transaction: t });
      if (!descuento) {
        await t.rollback();
        return res.status(400).json({ message: "Código de descuento inválido o inactivo." });
      }
      if (descuento.porcentaje && Number(descuento.porcentaje) > 0) {
        descuentoMonto = +(subtotal * (Number(descuento.porcentaje) / 100));
      } else if (descuento.monto_fijo && Number(descuento.monto_fijo) > 0) {
        descuentoMonto = Number(descuento.monto_fijo);
      }
    }

    // Evitar total negativo
    let total = +(subtotal + impuestos - descuentoMonto);
    if (total < 0) total = 0;

    // Crear pedido
    const nuevoPedido = await Pedido.create({
      usuario_id: userId,
      personas_mesa: Number(personas),
      subtotal: subtotal.toFixed(2),
      impuestos: impuestos.toFixed(2),
      descuento: descuentoMonto.toFixed(2),
      total: total.toFixed(2),
      estado: 'pendiente',
      fecha: new Date(),
    }, { transaction: t });

    // Crear items asociados al pedido
    for (const it of itemsToCreate) {
      await PedidoItem.create({
        pedido_id: nuevoPedido.id,
        producto_id: it.producto_id,
        nombre_producto: it.nombre_producto,
        precio_unitario: it.precio_unitario,
        cantidad: it.cantidad
      }, { transaction: t });
    }

    await t.commit();

    // Devolver el pedido con sus items
    const pedidoConItems = await Pedido.findByPk(nuevoPedido.id, {
      include: [{ model: PedidoItem }],
    });

    return res.status(201).json({ message: "Pedido creado correctamente", pedido: pedidoConItems });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error createOrder:", error);
    return res.status(500).json({ message: "Error al crear pedido", error: error.message || error });
  }
};


// Listar pedidos (ejemplo: admin)
exports.listOrders = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [{ model: PedidoItem }]
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
