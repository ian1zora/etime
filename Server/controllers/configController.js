const { Pedido, PedidoItem, Producto, Configuracion, sequelize } = require('../models');

// tu createOrder ya existe; manténla (la dejé en tu código)

exports.getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const pedidos = await Pedido.findAll({
      where: { usuario_id: userId },
      include: [{ model: PedidoItem }]
    });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({ include: [{ model: PedidoItem }] });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const pedido = await Pedido.findByPk(id, { include: [{ model: PedidoItem }] });
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    // si no es admin, validar que el pedido pertenezca al usuario
    if (req.user.role !== 'admin' && pedido.usuario_id !== req.user.id) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;
    const pedido = await Pedido.findByPk(id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    pedido.estado = estado;
    await pedido.save();
    res.json({ message: 'Estado actualizado', pedido });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
