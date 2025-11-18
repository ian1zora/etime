/* app.js — Landing + Cart slide-over completo */

let products = [];

const CATEGORIES = ['Todas','Entradas','Platos Principales','Postres','Bebidas'];
const PAGE_SIZE = 6;
const TAX_RATE = 0.21; // 21%

let filtered = [];
let currentPage = 1;
let currentCategory = 'Todas';
let currentSort = 'default';
let cart = {}; // { productId: qty }
let currentDiscount = { code: null, percent: 0 };

const dom = {
  categories: document.getElementById('categories'),
  productsGrid: document.getElementById('products'),
  pagination: document.getElementById('pagination'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  cartCount: document.getElementById('cart-count'),
  toast: document.getElementById('toast'),
  // cart panel elements
  cartPanel: document.getElementById('cart-panel'),
  cartClose: null,
  cartItems: document.getElementById('cart-items'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartDiscount: document.getElementById('cart-discount'),
  cartTax: document.getElementById('cart-tax'),
  cartTotal: document.getElementById('cart-total'),
  discountInput: document.getElementById('discount-input'),
  discountApply: document.getElementById('discount-apply'),
  cartWarning: document.getElementById('cart-warning'),
  checkoutBtn: document.getElementById('checkout-btn'),
};

// ------- DESCUENTOS VALIDOS (ejemplo) -------
const VALID_DISCOUNTS = {
  'PROMO10': 10,
  'DESCUENTO20': 20
};

// =========================
// INIT
// =========================
async function init() {
  // event listeners header cart button
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();

    products = data.map(p => ({
      id: p.id,
      name: p.nombre_producto,
      image: (p.imagen || '').startsWith('http') || (p.imagen || '').startsWith('data:')
             ? p.imagen
             : `/uploads/${p.imagen}`,
      price: Number(p.precio),
      category: p.Categorium?.nombre || 'Sin categoría'
    }));

    filtered = products.slice();
  } catch (err) {
    console.error('Error cargando productos desde API:', err);
    products = []; filtered = [];
  }

  renderCategories();
  applyFilters();
  restoreCart();

  dom.search.addEventListener('input', () => { currentPage = 1; applyFilters(); });
  dom.sort.addEventListener('change', () => { currentSort = dom.sort.value; applyFilters(); });

  // cart panel base listeners
  dom.cartClose = document.getElementById('cart-close');
  if (dom.cartClose) dom.cartClose.addEventListener('click', closeCart);
  if (dom.cartPanel) dom.cartPanel.addEventListener('click', (e) => {
    if (e.target === dom.cartPanel) closeCart();
  });
  if (dom.discountApply) dom.discountApply.addEventListener('click', applyDiscountFromInput);
  if (dom.checkoutBtn) dom.checkoutBtn.addEventListener('click', handleCheckout);
}

// =========================
// RENDER CATEGORIES
// =========================
function renderCategories() {
  dom.categories.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = cat === currentCategory ? 'active' : '';
    btn.addEventListener('click', () => {
      currentCategory = cat;
      currentPage = 1;
      applyFilters();
    });
    dom.categories.appendChild(btn);
  });
}

// =========================
// FILTERS & PRODUCTS
// =========================
function applyFilters() {
  filtered = products.filter(p => currentCategory === 'Todas' || p.category === currentCategory);
  const q = dom.search.value.trim().toLowerCase();
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  renderProducts();
  renderPagination();
}

function renderProducts() {
  dom.productsGrid.innerHTML = '';
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  pageItems.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb"><img src="${p.image}" alt="${p.name}" /></div>
      <div class="product-body">
        <h4>${p.name}</h4>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="product-footer">
          <button class="add-btn"><i class="fa-solid fa-plus-circle"></i>Añadir al carrito</button>
          <button class="details-btn bg-secondary-dark"><i class="fa-solid fa-eye"></i></button>
          <div class="cat">${p.category}</div>
        </div>
      </div>
    `;
    card.querySelector('.add-btn').addEventListener('click', () => addToCartFromUI(p.id));
    card.querySelector('.details-btn').addEventListener('click', () => showDetails(p));
    dom.productsGrid.appendChild(card);
  });

  if (pageItems.length === 0) dom.productsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:#444">No hay productos</div>';
}

// =========================
// PAGINATION
// =========================
function renderPagination() {
  dom.pagination.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const prev = document.createElement('button');
  prev.textContent = 'Anterior';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { currentPage = Math.max(1, currentPage - 1); applyFilters(); });
  dom.pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    if (i === currentPage) b.style.fontWeight = '700';
    b.addEventListener('click', () => { currentPage = i; applyFilters(); });
    dom.pagination.appendChild(b);
  }

  const next = document.createElement('button');
  next.textContent = 'Siguiente';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => { currentPage = Math.min(totalPages, currentPage + 1); applyFilters(); });
  dom.pagination.appendChild(next);
}

// =========================
// CART LOGIC
// =========================
function totalItemsInCart() {
  return Object.values(cart).reduce((s, n) => s + n, 0);
}

function addToCartFromUI(productId) {
  // límite: max 4 artículos en total
  if (totalItemsInCart() + 1 > 4) {
    showCartWarning('Límite: máximo 4 artículos por comensal.');
    return;
  }
  cart[productId] = (cart[productId] || 0) + 1;
  persistCart();
  updateCartCount();
  showToast('Añadido al carrito');
  // mantener panel abierto para feedback si ya abierto
  if (dom.cartPanel && dom.cartPanel.classList.contains('show')) renderCart();
}

function updateCartQty(productId, qty) {
  if (qty < 1) return;
  // check limit
  const currentTotal = totalItemsInCart();
  const prevQty = cart[productId] || 0;
  const newTotal = currentTotal - prevQty + qty;
  if (newTotal > 4) {
    showCartWarning('No puedes tener más de 4 artículos en total.');
    return false;
  }
  cart[productId] = qty;
  persistCart();
  updateCartCount();
  renderCart();
  return true;
}

function removeFromCart(productId) {
  delete cart[productId];
  persistCart();
  updateCartCount();
  renderCart();
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('discount', JSON.stringify(currentDiscount));
}

function restoreCart() {
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const savedDiscount = JSON.parse(localStorage.getItem('discount') || 'null');
    if (savedDiscount) currentDiscount = savedDiscount;
  } catch {
    cart = {};
    currentDiscount = { code: null, percent: 0 };
  }
  updateCartCount();
}

// =========================
// CART PANEL UI
// =========================
function openCart() {
  if (!dom.cartPanel) return;
  dom.cartPanel.classList.add('show');
  dom.cartPanel.classList.remove('hidden');
  renderCart();
}

function closeCart() {
  if (!dom.cartPanel) return;
  dom.cartPanel.classList.remove('show');
  dom.cartPanel.classList.add('hidden');
  clearCartWarning();
}

function renderCart() {
  dom.cartItems.innerHTML = '';
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    dom.cartItems.innerHTML = '<div style="padding:16px;color:#666">Tu carrito está vacío.</div>';
    updateSummary();
    return;
  }

  ids.forEach(id => {
    const prod = products.find(p => String(p.id) === String(id));
    const qty = cart[id];
    if (!prod) return;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" />
      <div class="cart-item-info">
        <h4>${prod.name}</h4>
        <div class="small">Precio: $${prod.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn dec" data-id="${id}">-</button>
          <div class="qty-display">${qty}</div>
          <button class="qty-btn inc" data-id="${id}">+</button>
          <button class="qty-btn remove" data-id="${id}">Eliminar</button>
        </div>
      </div>
    `;
    dom.cartItems.appendChild(item);
  });

  // attach events
  dom.cartItems.querySelectorAll('.qty-btn.inc').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      // try increase by 1, check limit
      if (totalItemsInCart() + 1 > 4) {
        showCartWarning('Límite: máximo 4 artículos por comensal.');
        return;
      }
      cart[id] = (cart[id] || 0) + 1;
      persistCart(); updateCartCount(); renderCart();
    });
  });
  dom.cartItems.querySelectorAll('.qty-btn.dec').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const newQty = (cart[id] || 1) - 1;
      if (newQty <= 0) {
        removeFromCart(id);
      } else {
        cart[id] = newQty;
        persistCart(); updateCartCount(); renderCart();
      }
    });
  });
  dom.cartItems.querySelectorAll('.qty-btn.remove').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });

  updateSummary();
}

function updateSummary() {
  // subtotal
  let subtotal = 0;
  Object.keys(cart).forEach(id => {
    const prod = products.find(p => String(p.id) === String(id));
    if (!prod) return;
    subtotal += prod.price * cart[id];
  });

  // discount
  const discountAmount = subtotal * (currentDiscount.percent / 100);

  // tax on (subtotal - discount)
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = taxable * TAX_RATE;

  const total = Math.max(0, taxable + tax);

  dom.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  dom.cartDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
  dom.cartTax.textContent = `$${tax.toFixed(2)}`;
  dom.cartTotal.textContent = `$${total.toFixed(2)}`;

  // show applied code in input
  if (dom.discountInput) dom.discountInput.value = currentDiscount.code || '';
}

// =========================
// DISCOUNT HANDLING
// =========================
function applyDiscountFromInput() {
  const code = dom.discountInput.value.trim().toUpperCase();
  if (!code) {
    currentDiscount = { code: null, percent: 0 };
    persistCart(); updateSummary(); showToast('Código removido.');
    return;
  }
  const percent = VALID_DISCOUNTS[code];
  if (!percent) {
    showCartWarning('Código inválido.');
    return;
  }
  currentDiscount = { code, percent };
  persistCart();
  updateSummary();
  showToast(`Descuento ${percent}% aplicado.`);
  clearCartWarning();
}

// =========================
// WARNINGS & UI HELPERS
// =========================
let warningTimeout = null;
function showCartWarning(msg) {
  if (!dom.cartWarning) return;
  dom.cartWarning.hidden = false;
  dom.cartWarning.textContent = msg;
  if (warningTimeout) clearTimeout(warningTimeout);
  warningTimeout = setTimeout(() => {
    dom.cartWarning.hidden = true;
  }, 3500);
}

function clearCartWarning() {
  if (!dom.cartWarning) return;
  dom.cartWarning.hidden = true;
  dom.cartWarning.textContent = '';
  if (warningTimeout) clearTimeout(warningTimeout);
}

// =========================
// CHECKOUT
// =========================
function handleCheckout() {
  // validations: at least 1 item, not exceed limit (should be covered)
  if (totalItemsInCart() === 0) {
    showCartWarning('El carrito está vacío.');
    return;
  }
  if (totalItemsInCart() > 4) {
    showCartWarning('Límite: máximo 4 artículos por comensal.');
    return;
  }

  // puedes redirigir a /checkout o mostrar modal resumen; por ahora mostramos resumen y redirigimos
  const orderSummary = {
    items: Object.keys(cart).map(id => {
      const prod = products.find(p => String(p.id) === String(id));
      return { id, name: prod?.name, qty: cart[id], price: prod?.price };
    }),
    discount: currentDiscount,
  };

  // persistir por si el checkout necesita leer
  localStorage.setItem('lastOrderSummary', JSON.stringify(orderSummary));

  // redirigir (si tenés ruta de checkout)
  // window.location.href = '/checkout';
  // por ahora mostramos confirmación simple
  alert('Proceder al pago (ejemplo). Resumen guardado en localStorage.');
  closeCart();
}

// =========================
// UTIL / UI feedback
// =========================
function updateCartCount() {
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  if (dom.cartCount) dom.cartCount.textContent = count;
}

function showToast(msg) {
  if (!dom.toast) return;
  dom.toast.hidden = false;
  dom.toast.textContent = msg;
  setTimeout(() => { dom.toast.hidden = true; }, 2000);
}

// =========================
// START
// =========================
document.addEventListener('DOMContentLoaded', init);
