const { Pedido, PedidoItem, Producto, Configuracion, sequelize } = require('../models');

exports.createOrder = async (req, res) => {
  const { items, personas_mesa } = req.body;
  const usuario_id = req.user.id;

  if (!items || items.length === 0)
    return res.status(400).json({ message: 'No hay productos en el pedido' });

  const config = await Configuracion.findOne({ where: { clave: 'max_items_por_persona' } });
  const limite = config ? parseInt(config.valor, 10) : 4;

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  if (totalItems > limite * personas_mesa) {
    return res.status(400).json({
      message: `Límite excedido: máximo ${limite * personas_mesa} artículos para ${personas_mesa} personas`
    });
  }

  const t = await sequelize.transaction();
  try {
    let subtotal = 0;
    const pedido = await Pedido.create({ usuario_id, personas_mesa, subtotal: 0, total: 0 }, { transaction: t });

    for (const it of items) {
      const prod = await Producto.findByPk(it.producto_id);
      if (!prod) throw new Error(`Producto ${it.producto_id} no existe`);
      const cantidad = it.cantidad;
      subtotal += prod.precio * cantidad;
      await PedidoItem.create({
        pedido_id: pedido.id,
        producto_id: prod.id,
        nombre_producto: prod.nombre_producto,
        precio_unitario: prod.precio,
        cantidad
      }, { transaction: t });
    }

    pedido.subtotal = subtotal;
    pedido.total = subtotal;
    await pedido.save({ transaction: t });
    await t.commit();

    res.status(201).json({ pedido });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
