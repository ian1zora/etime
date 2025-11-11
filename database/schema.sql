-- ============================================================
--  ETime Restaurante - Base de Datos MySQL
--  Proyecto eCommerce (Pedidos, Productos, Usuarios)
-- ============================================================

DROP DATABASE IF EXISTS restaurante;
CREATE DATABASE restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurante;

-- ============================================================
--  TABLA: usuario
-- ============================================================
CREATE TABLE `usuario` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre_usuario` VARCHAR(100) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `gmail` VARCHAR(255) NOT NULL,
  `rol` ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `usuario_gmail_unique` (`gmail`)
);

-- ============================================================
--  TABLA: categoria
-- ============================================================
CREATE TABLE `categoria` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL
);

-- ============================================================
--  TABLA: producto
-- ============================================================
CREATE TABLE `producto` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre_producto` VARCHAR(255) NOT NULL,
  `imagen` VARCHAR(255) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `disponible` BOOLEAN NOT NULL DEFAULT TRUE,
  `categoria_id` INT UNSIGNED NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `producto_categoria_id_foreign` FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`)
);

-- ============================================================
--  TABLA: carrito
-- ============================================================
CREATE TABLE `carrito` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT UNSIGNED NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `carrito_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`)
);

-- ============================================================
--  TABLA: carrito_item
-- ============================================================
CREATE TABLE `carrito_item` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `carrito_id` INT UNSIGNED NOT NULL,
  `producto_id` INT UNSIGNED NOT NULL,
  `cantidad` INT NOT NULL,
  CONSTRAINT `carrito_item_carrito_id_foreign` FOREIGN KEY (`carrito_id`) REFERENCES `carrito`(`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_item_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `producto`(`id`)
);

-- ============================================================
--  TABLA: pedido
-- ============================================================
CREATE TABLE `pedido` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT UNSIGNED NOT NULL,
  `personas_mesa` INT NOT NULL DEFAULT 1, -- NUEVO: define el número de comensales
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `impuestos` DECIMAL(10,2) NULL,
  `descuento` DECIMAL(10,2) NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `estado` ENUM('pendiente', 'pagado', 'enviado', 'cancelado', 'completado') DEFAULT 'pendiente',
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pedido_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`)
);

-- ============================================================
--  TABLA: pedido_item
-- ============================================================
CREATE TABLE `pedido_item` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `pedido_id` INT UNSIGNED NOT NULL,
  `producto_id` INT UNSIGNED NOT NULL,
  `nombre_producto` VARCHAR(255) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `cantidad` INT NOT NULL,
  CONSTRAINT `pedido_item_pedido_id_foreign` FOREIGN KEY (`pedido_id`) REFERENCES `pedido`(`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_item_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `producto`(`id`)
);

-- ============================================================
--  TABLA: descuento
-- ============================================================
CREATE TABLE `descuento` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL,
  `porcentaje` DECIMAL(5,2) NULL,
  `monto_fijo` DECIMAL(10,2) NULL,
  `activo` BOOLEAN DEFAULT TRUE,
  UNIQUE KEY `descuento_codigo_unique` (`codigo`)
);

-- ============================================================
--  TABLA: configuracion
--  Para ajustes globales del sistema
-- ============================================================
CREATE TABLE `configuracion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clave` VARCHAR(100) UNIQUE NOT NULL,
  `valor` VARCHAR(255) NOT NULL,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
--  DATOS INICIALES
-- ============================================================

-- Categorías de ejemplo
INSERT INTO `categoria` (`nombre`) VALUES
('Entradas'),
('Platos Principales'),
('Postres'),
('Bebidas');

-- Productos de ejemplo
INSERT INTO `producto` (`nombre_producto`, `imagen`, `precio`, `categoria_id`) VALUES
('Ensalada César', 'ensalada.jpg', 450.00, 1),
('Risotto de Hongos', 'risotto.jpg', 1200.00, 2),
('Tiramisú', 'tiramisu.jpg', 550.00, 3),
('Cerveza Artesanal', 'cerveza.jpg', 350.00, 4);
('Empanada de carne', 'https://example.com/empanada.jpg', 150.00, 1),
('Pizza Mozzarella', 'https://example.com/pizza.jpg', 1200.00, 2),
('Flan casero', 'https://example.com/flan.jpg', 450.00, 3),
('Coca Cola 500ml', 'https://example.com/coca.jpg', 300.00, 4);

-- Usuario admin de ejemplo
INSERT INTO `usuario` (`nombre_usuario`, `contrasena`, `gmail`, `rol`)
VALUES ('admin', 'admin123', 'admin@etime.com', 'admin');

-- Configuración inicial
INSERT INTO `configuracion` (`clave`, `valor`) VALUES
('max_items_por_persona', '4');

INSERT INTO descuento (codigo, porcentaje, monto_fijo, activo)
VALUES ('PROMO10', 10, NULL, true),
('PROMO20', 20, NULL, true),
('DESCUENTO50', NULL, 50.00, true);


INSERT INTO configuracion (clave, valor) VALUES
('impuesto', '21'),
('max_items_per_person', '4');



-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
