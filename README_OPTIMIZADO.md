# ETime — eCommerce Restaurante (Versión Optimizada)

## 🚀 Características Principales

- **Backend optimizado** con Node.js, Express y MySQL
- **Base de datos mejorada** con stored procedures, triggers y funciones
- **Seguridad avanzada** con rate limiting, validaciones y encriptación
- **Arquitectura limpia** con separación clara de responsabilidades
- **Validaciones robustas** en todos los niveles
- **Sistema de auditoría** completo
- **Gestión avanzada de descuentos** con múltiples tipos y validaciones
- **Configuración flexible** del sistema

## 📋 Requisitos

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd etime
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
```

### 3. Configurar Base de Datos
```bash
# Crear la base de datos
mysql -u root -p < ../database/schema_optimized.sql
```

### 4. Configurar variables de entorno
Editar el archivo `.env` con tus configuraciones:
```env
DB_HOST=localhost
DB_NAME=etime_restaurante
DB_USER=root
DB_PASS=tu_password
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### 5. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto Optimizada

```
etime/
├── backend/                    # Servidor Node.js
│   ├── config/                # Configuraciones
│   │   └── database.js        # Configuración de BD
│   ├── controllers/           # Controladores
│   ├── middlewares/          # Middlewares
│   ├── models/               # Modelos Sequelize
│   │   ├── index.js          # Configuración de modelos
│   │   ├── Usuario.js        # Modelo Usuario optimizado
│   │   ├── Categoria.js      # Modelo Categoria
│   │   ├── Producto.js       # Modelo Producto
│   │   ├── Pedido.js         # Modelo Pedido
│   │   ├── PedidoItem.js     # Modelo PedidoItem
│   │   ├── Descuento.js      # Modelo Descuento avanzado
│   │   └── Configuracion.js  # Modelo Configuracion
│   ├── routes/               # Rutas API
│   ├── utils/                # Utilidades
│   ├── .env.example          # Variables de entorno ejemplo
│   ├── package.json          # Dependencias backend
│   └── server.js             # Servidor principal
├── frontend/                 # Cliente React (por implementar)
├── database/                 # Scripts de base de datos
│   ├── schema.sql           # Schema original
│   └── schema_optimized.sql # Schema optimizado con SP, triggers
└── README_OPTIMIZADO.md     # Esta documentación
```

## 🗄️ Base de Datos Optimizada

### Nuevas Características:

#### 📊 Stored Procedures
- `crear_pedido()` - Creación completa de pedidos con validaciones
- `actualizar_estado_pedido()` - Actualización segura de estados
- `obtener_estadisticas_ventas()` - Estadísticas de ventas por período

#### ⚡ Funciones
- `calcular_impuestos()` - Cálculo automático de impuestos
- `validar_limite_items()` - Validación de límites por persona
- `generar_numero_pedido()` - Generación de números únicos
- `calcular_descuento()` - Cálculo de descuentos con validaciones

#### 🔄 Triggers
- Auditoría automática en usuarios y pedidos
- Validaciones antes de insertar/actualizar
- Cálculo automático de totales
- Generación automática de números de pedido

#### 👁️ Vistas
- `v_pedidos_completos` - Vista completa de pedidos con información del usuario
- `v_productos_categoria` - Productos con información de categoría

### Mejoras en Tablas:
- **Índices optimizados** para mejor rendimiento
- **Validaciones a nivel de BD** para integridad de datos
- **Campos adicionales** para funcionalidades avanzadas
- **Relaciones mejoradas** con cascadas apropiadas

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `GET /api/orders/:id` - Obtener pedido
- `PUT /api/orders/:id/status` - Actualizar estado

### Descuentos
- `GET /api/discounts` - Listar descuentos activos
- `POST /api/discounts/validate` - Validar código de descuento
- `POST /api/discounts` - Crear descuento (admin)

### Configuración
- `GET /api/settings` - Obtener configuraciones públicas
- `PUT /api/settings/:key` - Actualizar configuración (admin)

## 🔒 Seguridad Implementada

- **Rate Limiting** - Protección contra ataques de fuerza bruta
- **Helmet** - Headers de seguridad HTTP
- **CORS configurado** - Control de acceso entre dominios
- **Validación de entrada** - Sanitización de datos
- **JWT con expiración** - Autenticación segura
- **Bcrypt** - Hash seguro de contraseñas
- **Bloqueo de usuarios** - Después de intentos fallidos

## 📊 Características Avanzadas

### Sistema de Descuentos
- Descuentos por porcentaje o monto fijo
- Validación de fechas de vigencia
- Límites de uso por usuario y total
- Montos mínimos y máximos
- Aplicación por categorías específicas
- Exclusión de productos específicos

### Sistema de Configuración
- Configuraciones tipadas (string, number, boolean, json)
- Validaciones con regex
- Configuraciones públicas y privadas
- Categorización de configuraciones
- Valores por defecto

### Auditoría Completa
- Registro de todas las operaciones importantes
- Tracking de cambios en usuarios y pedidos
- Información de IP y timestamps
- Consultas de auditoría por tabla y fecha

## 🚀 Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Desarrollo con nodemon
npm start           # Producción
npm test            # Ejecutar tests
npm run lint        # Linter

# Base de datos
mysql -u root -p etime_restaurante < database/schema_optimized.sql
```

## 🔧 Configuraciones Importantes

### Límites del Sistema
- **Items por persona**: Configurable (default: 4)
- **Capacidad máxima por mesa**: Configurable (default: 8)
- **Tasa de impuesto**: Configurable (default: 21%)
- **Tiempo de preparación**: Configurable por producto

### Validaciones de Negocio
- Validación de stock antes de crear pedidos
- Verificación de límites por persona
- Validación de descuentos con múltiples criterios
- Control de estados de pedidos

## 📈 Monitoreo y Logs

- Logs estructurados con niveles
- Monitoreo de performance de queries
- Tracking de errores y excepciones
- Métricas de uso de API

## 🔄 Estados de Pedidos

1. **Pendiente** - Pedido creado, esperando confirmación
2. **Confirmado** - Pedido confirmado, listo para preparar
3. **Preparando** - En proceso de preparación
4. **Listo** - Listo para entregar
5. **Entregado** - Pedido completado
6. **Cancelado** - Pedido cancelado

## 🎯 Próximas Mejoras

- [ ] Frontend React optimizado
- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con sistemas de pago
- [ ] App móvil
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de reservas de mesas
- [ ] Integración con delivery

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@etime.com
- Issues: [GitHub Issues](link-to-issues)

---

**ETime Restaurant** - Sistema de pedidos optimizado para restaurantes 🍽️