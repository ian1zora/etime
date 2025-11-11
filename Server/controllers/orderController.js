// Server/controllers/orderController.js
const { Pedido, PedidoItem, Producto, Descuento, Configuracion, Usuario, sequelize } = require('../models');

const DEFAULT_MAX_PER_PERSON = 4;

async function getConfigNumber(clave, defaultVal = 0) {
  try {
    const cfg = await Configuracion.findOne({ where: { clave } });
    if (!cfg) return defaultVal;
    const parsed = Number(cfg.valor);
    return isNaN(parsed) ? defaultVal : parsed;
  } catch (err) {
    return defaultVal;
  }
}

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

    // Validar límite por comensal
    const maxPerPerson = await getConfigNumber('max_items_per_person', DEFAULT_MAX_PER_PERSON);
    const totalItemsCount = items.reduce((s, it) => s + Number(it.cantidad || 0), 0);
    if (totalItemsCount > Number(personas) * Number(maxPerPerson)) {
      await t.rollback();
      return res.status(400).json({ message: `Límite superado: máximo ${maxPerPerson} artículos por persona.` });
    }

       // Calcular subtotal y preparar items
    let subtotal = 0;
    const itemsToCreate = [];
    for (const it of items) {
      const productoId = it.producto_id || it.id || it.productoId;
      const cantidad = Number(it.cantidad ?? it.qty ?? 0);
      if (!productoId || !cantidad || cantidad <= 0) {
        await t.rollback();
        return res.status(400).json({ message: "Cada item debe tener producto_id y cantidad > 0." });
      }
      const producto = await Producto.findByPk(productoId, { transaction: t });
      if (!producto || producto.disponible === false) {
        await t.rollback();
        return res.status(404).json({ message: `Producto ${productoId} no encontrado o no disponible.` });
      }
      const precio = Number(producto.precio);
      subtotal += precio * cantidad;
      itemsToCreate.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre_producto,
        precio_unitario: precio,
        cantidad
      });
    }

    // Impuestos (config: clave 'impuesto' => porcentaje)
    const impuestoPercent = await getConfigNumber('impuesto', 0);
    const impuestos = +(subtotal * (impuestoPercent / 100));


    // Descuento
    let descuentoMonto = 0;
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

    // Crear items
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

    // Devolver pedido con items
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

// Listar pedidos (admin)
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

// Pedidos del usuario autenticado
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const pedidos = await Pedido.findAll({
      where: { usuario_id: userId },
      include: [{ model: PedidoItem }]
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos del usuario", error });
  }
};

// Obtener pedido por id (propietario o admin)
exports.getOrderById = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, { include: [{ model: PedidoItem }] });
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
    // si no es admin, verificar que sea del usuario
    if (req.user.role !== 'admin' && pedido.usuario_id !== req.user.id) {
      return res.status(403).json({ message: "No autorizado para ver este pedido" });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedido", error });
  }
};

// Actualizar estado del pedido (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const allowedStates = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    const { estado } = req.body;
    if (!estado || !allowedStates.includes(estado)) {
      return res.status(400).json({ message: `Estado inválido. Estados permitidos: ${allowedStates.join(', ')}` });
    }

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    pedido.estado = estado;
    await pedido.save();

    return res.json({ message: "Estado de pedido actualizado", pedido });
  } catch (error) {
    console.error("Error updateOrderStatus:", error);
    return res.status(500).json({ message: "Error al actualizar estado", error: error.message || error });
  }
};
