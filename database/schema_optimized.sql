-- ============================================================
--  ETime Restaurante - Base de Datos MySQL Optimizada
--  Proyecto eCommerce con Stored Procedures, Triggers y Funciones
-- ============================================================

DROP DATABASE IF EXISTS etime_restaurante;
CREATE DATABASE etime_restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE etime_restaurante;

-- ============================================================
--  TABLAS PRINCIPALES
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
  UNIQUE KEY usuario_email_unique (email),
  INDEX idx_usuario_rol (rol),
  INDEX idx_usuario_activo (activo)
);

CREATE TABLE categoria (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden_display INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY categoria_nombre_unique (nombre),
  INDEX idx_categoria_activo (activo)
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
  CONSTRAINT producto_categoria_fk FOREIGN KEY (categoria_id) REFERENCES categoria(id),
  INDEX idx_producto_categoria (categoria_id),
  INDEX idx_producto_disponible (disponible),
  INDEX idx_producto_precio (precio)
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
  CONSTRAINT pedido_usuario_fk FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_pedido_usuario (usuario_id),
  INDEX idx_pedido_estado (estado),
  INDEX idx_pedido_fecha (fecha_pedido)
);

CREATE TABLE pedido_item (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(255) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT pedido_item_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  CONSTRAINT pedido_item_producto_fk FOREIGN KEY (producto_id) REFERENCES producto(id),
  INDEX idx_pedido_item_pedido (pedido_id),
  INDEX idx_pedido_item_producto (producto_id)
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
  UNIQUE KEY descuento_codigo_unique (codigo),
  INDEX idx_descuento_activo (activo),
  INDEX idx_descuento_fechas (fecha_inicio, fecha_fin)
);

CREATE TABLE configuracion (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor VARCHAR(500) NOT NULL,
  descripcion TEXT,
  tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_configuracion_clave (clave)
);

CREATE TABLE auditoria (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,
  operacion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  registro_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED,
  datos_anteriores JSON,
  datos_nuevos JSON,
  fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  INDEX idx_auditoria_tabla (tabla),
  INDEX idx_auditoria_fecha (fecha_operacion),
  INDEX idx_auditoria_usuario (usuario_id)
);

-- ============================================================
--  FUNCIONES
-- ============================================================

DELIMITER //

CREATE FUNCTION calcular_impuestos(subtotal DECIMAL(10,2))
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE tasa_impuesto DECIMAL(5,2);
    
    SELECT CAST(valor AS DECIMAL(5,2)) INTO tasa_impuesto 
    FROM configuracion 
    WHERE clave = 'tasa_impuesto';
    
    IF tasa_impuesto IS NULL THEN
        SET tasa_impuesto = 21.00;
    END IF;
    
    RETURN ROUND(subtotal * (tasa_impuesto / 100), 2);
END //

CREATE FUNCTION validar_limite_items(p_personas_mesa INT, p_total_items INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE limite_por_persona INT;
    DECLARE limite_total INT;
    
    SELECT CAST(valor AS UNSIGNED) INTO limite_por_persona 
    FROM configuracion 
    WHERE clave = 'max_items_per_person';
    
    IF limite_por_persona IS NULL THEN
        SET limite_por_persona = 4;
    END IF;
    
    SET limite_total = p_personas_mesa * limite_por_persona;
    
    RETURN p_total_items <= limite_total;
END //

CREATE FUNCTION generar_numero_pedido()
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE nuevo_numero VARCHAR(20);
    DECLARE contador INT DEFAULT 1;
    DECLARE existe INT DEFAULT 1;
    
    WHILE existe > 0 DO
        SET nuevo_numero = CONCAT('PED-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(contador, 4, '0'));
        
        SELECT COUNT(*) INTO existe 
        FROM pedido 
        WHERE numero_pedido = nuevo_numero;
        
        SET contador = contador + 1;
    END WHILE;
    
    RETURN nuevo_numero;
END //

CREATE FUNCTION calcular_descuento(p_codigo VARCHAR(50), p_subtotal DECIMAL(10,2))
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE descuento_valor DECIMAL(10,2) DEFAULT 0.00;
    DECLARE descuento_tipo ENUM('porcentaje', 'monto_fijo');
    DECLARE descuento_monto DECIMAL(10,2);
    DECLARE monto_minimo DECIMAL(10,2);
    
    SELECT tipo, valor, monto_minimo 
    INTO descuento_tipo, descuento_monto, monto_minimo
    FROM descuento 
    WHERE codigo = p_codigo 
    AND activo = TRUE 
    AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
    AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
    AND (usos_maximos IS NULL OR usos_actuales < usos_maximos);
    
    IF descuento_tipo IS NOT NULL AND p_subtotal >= IFNULL(monto_minimo, 0) THEN
        IF descuento_tipo = 'porcentaje' THEN
            SET descuento_valor = ROUND(p_subtotal * (descuento_monto / 100), 2);
        ELSE
            SET descuento_valor = descuento_monto;
        END IF;
        
        IF descuento_valor > p_subtotal THEN
            SET descuento_valor = p_subtotal;
        END IF;
    END IF;
    
    RETURN descuento_valor;
END //

DELIMITER ;

-- ============================================================
--  STORED PROCEDURES
-- ============================================================

DELIMITER //

CREATE PROCEDURE crear_pedido(
    IN p_usuario_id INT UNSIGNED,
    IN p_personas_mesa INT,
    IN p_items JSON,
    IN p_codigo_descuento VARCHAR(50),
    OUT p_pedido_id INT UNSIGNED,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_impuestos DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_descuento DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_numero_pedido VARCHAR(20);
    DECLARE v_total_items INT DEFAULT 0;
    DECLARE v_item_count INT DEFAULT 0;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_nombre_producto VARCHAR(255);
    DECLARE v_disponible BOOLEAN;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error al crear el pedido';
        SET p_pedido_id = NULL;
    END;
    
    START TRANSACTION;
    
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = p_usuario_id AND activo = TRUE) THEN
        SET p_mensaje = 'Usuario no válido';
        SET p_pedido_id = NULL;
        ROLLBACK;
        LEAVE crear_pedido;
    END IF;
    
    SET v_item_count = JSON_LENGTH(p_items);
    SET v_i = 0;
    
    WHILE v_i < v_item_count DO
        SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));
        SET v_total_items = v_total_items + v_cantidad;
        SET v_i = v_i + 1;
    END WHILE;
    
    IF NOT validar_limite_items(p_personas_mesa, v_total_items) THEN
        SET p_mensaje = 'Excede el límite de items por persona';
        SET p_pedido_id = NULL;
        ROLLBACK;
        LEAVE crear_pedido;
    END IF;
    
    SET v_i = 0;
    WHILE v_i < v_item_count DO
        SET v_producto_id = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].producto_id')));
        SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));
        
        SELECT precio, nombre_producto, disponible 
        INTO v_precio, v_nombre_producto, v_disponible
        FROM producto 
        WHERE id = v_producto_id;
        
        IF v_precio IS NULL OR NOT v_disponible THEN
            SET p_mensaje = CONCAT('Producto no disponible: ', IFNULL(v_nombre_producto, CONCAT('ID ', v_producto_id)));
            SET p_pedido_id = NULL;
            ROLLBACK;
            LEAVE crear_pedido;
        END IF;
        
        SET v_subtotal = v_subtotal + (v_precio * v_cantidad);
        SET v_i = v_i + 1;
    END WHILE;
    
    SET v_impuestos = calcular_impuestos(v_subtotal);
    
    IF p_codigo_descuento IS NOT NULL AND p_codigo_descuento != '' THEN
        SET v_descuento = calcular_descuento(p_codigo_descuento, v_subtotal);
    END IF;
    
    SET v_total = v_subtotal + v_impuestos - v_descuento;
    SET v_numero_pedido = generar_numero_pedido();
    
    INSERT INTO pedido (
        usuario_id, numero_pedido, personas_mesa, subtotal, 
        impuestos, descuento, total, estado
    ) VALUES (
        p_usuario_id, v_numero_pedido, p_personas_mesa, v_subtotal,
        v_impuestos, v_descuento, v_total, 'pendiente'
    );
    
    SET p_pedido_id = LAST_INSERT_ID();
    
    SET v_i = 0;
    WHILE v_i < v_item_count DO
        SET v_producto_id = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].producto_id')));
        SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));
        
        SELECT precio, nombre_producto 
        INTO v_precio, v_nombre_producto
        FROM producto 
        WHERE id = v_producto_id;
        
        INSERT INTO pedido_item (
            pedido_id, producto_id, nombre_producto, 
            precio_unitario, cantidad, subtotal
        ) VALUES (
            p_pedido_id, v_producto_id, v_nombre_producto,
            v_precio, v_cantidad, v_precio * v_cantidad
        );
        
        SET v_i = v_i + 1;
    END WHILE;
    
    IF v_descuento > 0 AND p_codigo_descuento IS NOT NULL THEN
        UPDATE descuento 
        SET usos_actuales = usos_actuales + 1 
        WHERE codigo = p_codigo_descuento;
    END IF;
    
    COMMIT;
    SET p_mensaje = 'Pedido creado exitosamente';
    
END //

CREATE PROCEDURE actualizar_estado_pedido(
    IN p_pedido_id INT UNSIGNED,
    IN p_nuevo_estado VARCHAR(20),
    IN p_usuario_id INT UNSIGNED,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error al actualizar el estado del pedido';
    END;
    
    START TRANSACTION;
    
    SELECT estado INTO v_estado_actual 
    FROM pedido 
    WHERE id = p_pedido_id;
    
    IF v_estado_actual IS NULL THEN
        SET p_mensaje = 'Pedido no encontrado';
        ROLLBACK;
        LEAVE actualizar_estado_pedido;
    END IF;
    
    IF (v_estado_actual = 'cancelado' OR v_estado_actual = 'entregado') THEN
        SET p_mensaje = 'No se puede cambiar el estado de un pedido cancelado o entregado';
        ROLLBACK;
        LEAVE actualizar_estado_pedido;
    END IF;
    
    UPDATE pedido 
    SET estado = p_nuevo_estado,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = p_pedido_id;
    
    COMMIT;
    SET p_mensaje = 'Estado actualizado correctamente';
    
END //

CREATE PROCEDURE obtener_estadisticas_ventas(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(fecha_pedido) as fecha,
        COUNT(*) as total_pedidos,
        SUM(total) as total_ventas,
        AVG(total) as promedio_pedido,
        SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as pedidos_completados,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados
    FROM pedido 
    WHERE DATE(fecha_pedido) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY DATE(fecha_pedido)
    ORDER BY fecha DESC;
END //

DELIMITER ;

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