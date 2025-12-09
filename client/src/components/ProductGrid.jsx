export default function ProductGrid({ products, onAddToCart }) {
  if (products.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#444' }}>No hay productos</div>
  }

  return (
    <div className="products-grid">
      {products.map(p => (
        <article key={p.id} className="product-card">
          <div className="product-thumb">
            <img src={p.image} alt={p.name} />
          </div>
          <div className="product-body">
            <h4>{p.name}</h4>
            <div className="price">${p.price.toFixed(2)}</div>
            <div className="product-footer">
              <button className="add-btn" onClick={() => onAddToCart(p.id)}>
                Añadir al carrito
              </button>
              <div className="cat">{p.category}</div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
