
import React from 'react';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

export default function Checkout() {
  const { state, dispatch } = useCart();

  const handlePlaceOrder = async () => {
    const items = state.items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
    try {
      const token = localStorage.getItem('token'); // luego implementar auth headers
      const resp = await axios.post('/api/orders', {
        items,
        people_count: state.peopleCount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pedido creado correctamente');
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear pedido');
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {/* mostrar items, total, selector peopleCount que hace dispatch SET_PEOPLE */}
      <button onClick={handlePlaceOrder}>Enviar pedido</button>
    </div>
  );
}
