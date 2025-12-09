import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import PromoSlider from './components/PromoSlider'
import Controls from './components/Controls'
import ProductGrid from './components/ProductGrid'
import CartPanel from './components/CartPanel'
import Toast from './components/Toast'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'

const PAGE_SIZE = 6
const TAX_RATE = 0.21
const VALID_DISCOUNTS = { 'PROMO10': 10, 'DESCUENTO20': 20 }

const getCategoryName = (catId) => {
  const names = ['', 'Entradas', 'Platos Principales', 'Postres', 'Bebidas']
  return names[catId] || 'Sin categoría'
}

export default function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Todas'])
  const [filtered, setFiltered] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [currentCategory, setCurrentCategory] = useState('Todas')
  const [currentSort, setCurrentSort] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState({})
  const [discount, setDiscount] = useState({ code: null, percent: 0 })
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [cartWarning, setCartWarning] = useState('')
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ])
        const catData = await catRes.json()
        const prodData = await prodRes.json()
        
        if (catData.success) {
          setCategories(['Todas', ...catData.data.map(c => c.nombre)])
        }
        if (prodData.success) {
          setProducts(prodData.data.map(p => ({
            id: p.id,
            name: p.nombre_producto,
            image: (p.imagen || '').startsWith('http') || (p.imagen || '').startsWith('data:') 
              ? p.imagen : `/uploads/${p.imagen}`,
            price: Number(p.precio),
            category: getCategoryName(p.categoria_id)
          })))
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }
    loadData()
    
    const savedCart = JSON.parse(localStorage.getItem('cart') || '{}')
    const savedDiscount = JSON.parse(localStorage.getItem('discount') || 'null')
    setCart(savedCart)
    if (savedDiscount) setDiscount(savedDiscount)
  }, [])

  useEffect(() => {
    let result = products.filter(p => currentCategory === 'Todas' || p.category === currentCategory)
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (currentSort === 'price-asc') result.sort((a, b) => a.price - b.price)
    if (currentSort === 'price-desc') result.sort((a, b) => b.price - a.price)
    setFiltered(result)
  }, [products, currentCategory, searchQuery, currentSort])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.setItem('discount', JSON.stringify(discount))
  }, [cart, discount])

  const totalItems = Object.values(cart).reduce((s, n) => s + n, 0)

  const addToCart = (id) => {
    if (!user) {
      setToast('Debes iniciar sesión para agregar productos')
      setTimeout(() => setToast(''), 3000)
      return
    }
    if (totalItems + 1 > 4) {
      setCartWarning('Límite: máximo 4 artículos por comensal.')
      setTimeout(() => setCartWarning(''), 3500)
      return
    }
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    setToast('Añadido al carrito')
    setTimeout(() => setToast(''), 2000)
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return
    const newTotal = totalItems - (cart[id] || 0) + qty
    if (newTotal > 4) {
      setCartWarning('No puedes tener más de 4 artículos en total.')
      setTimeout(() => setCartWarning(''), 3500)
      return
    }
    setCart(prev => ({ ...prev, [id]: qty }))
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[id]
      return newCart
    })
  }

  const applyDiscount = (code) => {
    if (!code) {
      setDiscount({ code: null, percent: 0 })
      setToast('Código removido.')
      setTimeout(() => setToast(''), 2000)
      return
    }
    const percent = VALID_DISCOUNTS[code.toUpperCase()]
    if (!percent) {
      setCartWarning('Código inválido.')
      setTimeout(() => setCartWarning(''), 3500)
      return
    }
    setDiscount({ code: code.toUpperCase(), percent })
    setToast(`Descuento ${percent}% aplicado.`)
    setTimeout(() => setToast(''), 2000)
    setCartWarning('')
  }

  const handleCheckout = () => {
    if (totalItems === 0) {
      setCartWarning('El carrito está vacío.')
      setTimeout(() => setCartWarning(''), 3500)
      return
    }
    const orderSummary = {
      items: Object.keys(cart).map(id => {
        const prod = products.find(p => String(p.id) === String(id))
        return { id, name: prod?.name, qty: cart[id], price: prod?.price }
      }),
      discount
    }
    localStorage.setItem('lastOrderSummary', JSON.stringify(orderSummary))
    window.location.href = '/checkout.html'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setCart({})
    setToast('Sesión cerrada')
    setTimeout(() => setToast(''), 2000)
  }

  const pageProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  if (showLogin) return <Login onLogin={(u) => { setUser(u); setShowLogin(false) }} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }} />
  if (showRegister) return <Register onRegister={(u) => { setUser(u); setShowRegister(false) }} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }} />

  return (
    <>
      <Header 
        cartCount={totalItems} 
        onCartClick={() => setCartOpen(true)} 
        user={user}
        onLogout={handleLogout}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
      />
      <Hero />
      <Controls 
        categories={categories}
        currentCategory={currentCategory}
        onCategoryChange={(cat) => { setCurrentCategory(cat); setCurrentPage(1) }}
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1) }}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />
      <main id="catalog" className="catalog">
        <PromoSlider />
        <h3>Catálogo</h3>
        <ProductGrid products={pageProducts} onAddToCart={addToCart} />
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} style={{ fontWeight: currentPage === i + 1 ? '700' : '400' }} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
        </div>
      </main>
      <Footer />
      <CartPanel 
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        discount={discount}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onApplyDiscount={applyDiscount}
        onCheckout={handleCheckout}
        warning={cartWarning}
        taxRate={TAX_RATE}
      />
      {toast && <Toast message={toast} />}
    </>
  )
}
