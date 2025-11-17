let products = [];

const CATEGORIES = ['Todas','Entradas','Platos Principales','Postres','Bebidas'];
const PAGE_SIZE = 6;

let filtered = [];
let currentPage = 1;
let currentCategory = 'Todas';
let currentSort = 'default';
let cart = {};

const dom = {
  categories: document.getElementById('categories'),
  productsGrid: document.getElementById('products'),
  pagination: document.getElementById('pagination'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  cartCount: document.getElementById('cart-count'),
  toast: document.getElementById('toast'),
};


// =========================
// INIT
// =========================
async function init() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();

    products = data.map(p => ({
      id: p.id,
      name: p.nombre_producto,
      image: p.imagen.startsWith('http') ? p.imagen : `/uploads/${p.imagen}`,
      price: Number(p.precio),
      category: p.Categorium?.nombre || 'Sin categoría'
    }));

    filtered = products.slice();
  } catch (err) {
    console.error('Error cargando productos desde API:', err);
    products = SAMPLE_PRODUCTS;
    filtered = products.slice();
  }

  renderCategories();
  applyFilters();
  restoreCart();

  dom.search.addEventListener('input', () => { currentPage = 1; applyFilters(); });
  dom.sort.addEventListener('change', () => { currentSort = dom.sort.value; applyFilters(); });
}


// =========================
// CATEGORY RENDER
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
// FILTERS
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


// =========================
// PRODUCT CARDS
// =========================
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
        <div class="price">$${p.price}</div>
        <div class="product-footer">
          <button class="add-btn">Añadir al carrito</button>
          <button class="details-btn">Ver detalles</button>
          <div class="cat">${p.category}</div>
        </div>
      </div>
    `;

    card.querySelector('.add-btn').addEventListener('click', () => addToCart(p));
    card.querySelector('.details-btn').addEventListener('click', () => showDetails(p));

    dom.productsGrid.appendChild(card);
  });

  if (pageItems.length === 0) {
    dom.productsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:#444">No hay productos</div>';
  }
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
  prev.addEventListener('click', () => { currentPage--; applyFilters(); });
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
  next.addEventListener('click', () => { currentPage++; applyFilters(); });
  dom.pagination.appendChild(next);
}


// =========================
// CART
// =========================
function restoreCart() {
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '{}');
  } catch {
    cart = {};
  }
  updateCartCount();
}

function addToCart(p) {
  cart[p.id] = (cart[p.id] || 0) + 1;
  updateCartCount();
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast(`${p.name} añadido al carrito`);
}

function updateCartCount() {
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  dom.cartCount.textContent = count;
}

function showToast(msg) {
  dom.toast.hidden = false;
  dom.toast.textContent = msg;
  setTimeout(() => dom.toast.hidden = true, 2000);
}


// =========================
// MODAL — DETALLES PRODUCTO
// =========================
function showDetails(p) {
  document.getElementById('modal-img').src = p.image;
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-price').textContent = `Precio: $${p.price}`;
  document.getElementById('modal-category').textContent = `Categoría: ${p.category}`;

  document.getElementById('modal').classList.remove('hidden');
}


// =========================
// MODAL EVENTOS
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const close = document.getElementById('modal-close');

  close.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});


// =========================
document.addEventListener('DOMContentLoaded', init);
