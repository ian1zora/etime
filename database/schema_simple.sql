-- ============================================================
--  ETime Restaurante - Base de Datos MySQL Simple
-- ============================================================

DROP DATABASE IF EXISTS etime_restaurante;
CREATE DATABASE etime_restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE etime_restaurante;

-- ============================================================
--  TABLAS
-- ============================================================

CREATE TABLE usuario (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY usuario_email_unique (email)
);

CREATE TABLE categoria (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden_display INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY categoria_nombre_unique (nombre)
);

CREATE TABLE producto (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre_producto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(500) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  stock INT DEFAULT 0,
  categoria_id INT UNSIGNED NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

CREATE TABLE pedido (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero_pedido VARCHAR(20) UNIQUE NOT NULL,
  personas_mesa INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  impuestos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estado ENUM('pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notas TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE pedido_item (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(255) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES producto(id)
);

CREATE TABLE descuento (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('porcentaje', 'monto_fijo') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  monto_minimo DECIMAL(10,2) DEFAULT 0.00,
  usos_maximos INT DEFAULT NULL,
  usos_actuales INT DEFAULT 0,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY descuento_codigo_unique (codigo)
);

CREATE TABLE configuracion (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor VARCHAR(500) NOT NULL,
  descripcion TEXT,
  tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
--  DATOS INICIALES
-- ============================================================

INSERT INTO categoria (nombre, descripcion, activo, orden_display) VALUES
('Entradas', 'Platos para comenzar la comida', TRUE, 1),
('Platos Principales', 'Platos principales del menú', TRUE, 2),
('Postres', 'Dulces y postres', TRUE, 3),
('Bebidas', 'Bebidas frías y calientes', TRUE, 4);

INSERT INTO producto (nombre_producto, descripcion, imagen, precio, disponible, stock, categoria_id) VALUES
('Ensalada César', 'Ensalada fresca con lechuga, crutones y aderezo césar', 'ensalada-cesar.jpg', 450.00, TRUE, 50, 1),
('Empanadas de Carne', 'Empanadas caseras rellenas de carne', 'empanadas-carne.jpg', 150.00, TRUE, 100, 1),
('Risotto de Hongos', 'Risotto cremoso con hongos frescos', 'risotto-hongos.jpg', 1200.00, TRUE, 30, 2),
('Pizza Margherita', 'Pizza clásica con tomate, mozzarella y albahaca', 'pizza-margherita.jpg', 950.00, TRUE, 25, 2),
('Tiramisú', 'Postre italiano con café y mascarpone', 'tiramisu.jpg', 550.00, TRUE, 20, 3),
('Flan Casero', 'Flan tradicional con dulce de leche', 'flan-casero.jpg', 450.00, TRUE, 30, 3),
('Cerveza Artesanal', 'Cerveza local artesanal', 'cerveza-artesanal.jpg', 350.00, TRUE, 100, 4),
('Agua Mineral', 'Agua mineral sin gas', 'agua-mineral.jpg', 200.00, TRUE, 200, 4);

INSERT INTO usuario (nombre_usuario, contrasena, email, rol) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@etime.com', 'admin'),
('cliente_demo', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente@demo.com', 'cliente');

INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('max_items_per_person', '4', 'Máximo número de items por persona en un pedido', 'number'),
('tasa_impuesto', '21.00', 'Tasa de impuesto en porcentaje', 'number'),
('moneda', 'ARS', 'Moneda utilizada en el sistema', 'string'),
('tiempo_preparacion_promedio', '30', 'Tiempo promedio de preparación en minutos', 'number'),
('horario_apertura', '11:00', 'Horario de apertura del restaurante', 'string'),
('horario_cierre', '23:00', 'Horario de cierre del restaurante', 'string');

INSERT INTO descuento (codigo, nombre, tipo, valor, monto_minimo, usos_maximos, fecha_inicio, fecha_fin, activo) VALUES
('BIENVENIDO10', 'Descuento de Bienvenida', 'porcentaje', 10.00, 500.00, 100, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('PROMO20', 'Promoción 20%', 'porcentaje', 20.00, 1000.00, 50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), TRUE),
('DESCUENTO50', 'Descuento Fijo $50', 'monto_fijo', 50.00, 300.00, NULL, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), TRUE);