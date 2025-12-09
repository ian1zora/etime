// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Funciones para conectar con el backend
const API = {
  // Obtener todas las categorías
  async getCategorias() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener todos los productos
  async getProductos() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener productos por categoría
  async getProductosPorCategoria(categoriaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categoria/${categoriaId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

// Funciones para mostrar datos en el frontend
function mostrarCategorias() {
  API.getCategorias().then(response => {
    if (response.success) {
      console.log('Categorías:', response.data);
      const categoriasContainer = document.getElementById('categorias');
      if (categoriasContainer) {
        categoriasContainer.innerHTML = response.data.map(categoria => 
          `<div class="categoria" onclick="mostrarProductosPorCategoria(${categoria.id})">
            <h3>${categoria.nombre}</h3>
            <p>${categoria.descripcion}</p>
          </div>`
        ).join('');
      }
    } else {
      console.error('Error:', response.message);
    }
  });
}

function mostrarProductos() {
  API.getProductos().then(response => {
    if (response.success) {
      console.log('Productos:', response.data);
      const productosContainer = document.getElementById('productos');
      if (productosContainer) {
        productosContainer.innerHTML = response.data.map(producto => 
          `<div class="producto">
            <img src="${producto.imagen}" alt="${producto.nombre_producto}" onerror="this.src='https://via.placeholder.com/200x150?text=Imagen+No+Disponible'">
            <h4>${producto.nombre_producto}</h4>
            <p>${producto.descripcion}</p>
            <span class="precio">$${producto.precio}</span>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
          </div>`
        ).join('');
      }
    } else {
      console.error('Error:', response.message);
    }
  });
}

function mostrarProductosPorCategoria(categoriaId) {
  API.getProductosPorCategoria(categoriaId).then(response => {
    if (response.success) {
      console.log('Productos de la categoría:', response.data);
      const productosContainer = document.getElementById('productos');
      if (productosContainer) {
        productosContainer.innerHTML = response.data.map(producto => 
          `<div class="producto">
            <img src="${producto.imagen}" alt="${producto.nombre_producto}" onerror="this.src='https://via.placeholder.com/200x150?text=Imagen+No+Disponible'">
            <h4>${producto.nombre_producto}</h4>
            <p>${producto.descripcion}</p>
            <span class="precio">$${producto.precio}</span>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
          </div>`
        ).join('');
      }
    }
  });
}

function agregarAlCarrito(productoId) {
  console.log('Agregando producto al carrito:', productoId);
  alert('Producto agregado al carrito');
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Conectando con API...');
  mostrarCategorias();
  mostrarProductos();
});