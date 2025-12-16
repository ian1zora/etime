import { useState } from 'react'

export default function CartPanel({ open, onClose, cart, products, discount, onUpdateQty, onRemove, onApplyDiscount, onCheckout, warning, taxRate }) {
  const [discountInput, setDiscountInput] = useState(discount.code || '')

  const cartItems = Object.keys(cart).map(id => {
    const prod = products.find(p => String(p.id) === String(id))
    return { id, product: prod, qty: cart[id] }
  }).filter(item => item.product)

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  const discountAmount = subtotal * (discount.percent / 100)
  const taxable = Math.max(0, subtotal - discountAmount)
  const tax = taxable * taxRate
  const total = Math.max(0, taxable + tax)

  const handleApply = () => {
    onApplyDiscount(discountInput)
  }

  return (
    <aside className={`cart-panel ${open ? 'show' : 'hidden'}`} onClick={(e) => e.target.classList.contains('cart-panel') && onClose()}>
      <div className="cart-panel-inner">
        <header className="cart-header">
          <h2>Tu carrito</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </header>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div style={{ padding: '16px', color: '#666' }}>Tu carrito está vacío.</div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.product.image} alt={item.product.name} />
                <div className="cart-item-info">
                  <h4>{item.product.name}</h4>
                  <div className="small">Precio: ${item.product.price.toFixed(2)}</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn dec" onClick={() => item.qty > 1 ? onUpdateQty(item.id, item.qty - 1) : onRemove(item.id)}>-</button>
                    <div className="qty-display">{item.qty}</div>
                    <button className="qty-btn inc" onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                    <button className="qty-btn remove" onClick={() => onRemove(item.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="cart-row">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-row">
            <span>Descuento</span><span>-${discountAmount.toFixed(2)}</span>
          </div>
          <div className="cart-row">
            <span>Impuesto (21%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div className="cart-row total">
            <strong>Total</strong><strong>${total.toFixed(2)}</strong>
          </div>

          <div className="discount-code">
            <input 
              placeholder="Código de descuento" 
              value={discountInput} 
              onChange={(e) => setDiscountInput(e.target.value)} 
            />
            <button className="btn-apply" onClick={handleApply}>Aplicar</button>
          </div>

          {warning && <div className="cart-warning">{warning}</div>}

          <div className="cart-actions">
            <button className="btn-checkout" onClick={onCheckout}>Finalizar Compra</button>
          </div>
        </div>
      </div>
    </aside>
  )
}
