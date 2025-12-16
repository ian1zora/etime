# E-TIME Restaurant - React Integration

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias del cliente React

```bash
cd client
npm install
```

### 2. Construir la aplicación React

```bash
npm run build
```

### 3. Iniciar el servidor backend

```bash
cd ../backend
npm install
npm start
```

La aplicación estará disponible en: http://localhost:5000

## 🛠️ Desarrollo

Para desarrollo con hot-reload:

**Terminal 1 - Cliente React:**
```bash
cd client
npm run dev
```
Esto iniciará Vite en http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

## 📁 Estructura del Proyecto

```
etime/
├── backend/          # API Express + Sequelize
├── client/           # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── CartPanel.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── assets/       # Imágenes e iconos
│   ├── public/       # Archivos estáticos
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── database/         # Schemas SQL
```

## ✨ Características

- ✅ React 18 con Hooks
- ✅ Vite para desarrollo rápido
- ✅ Componentes modulares
- ✅ Gestión de estado con useState/useEffect
- ✅ Carrito de compras funcional
- ✅ Sistema de descuentos
- ✅ Filtros y búsqueda
- ✅ Paginación
- ✅ Responsive design
- ✅ Backend API REST intacto

## 🎨 Mejoras de React

1. **Componentes reutilizables**: Código más limpio y mantenible
2. **Estado reactivo**: Actualizaciones automáticas de UI
3. **Performance**: Virtual DOM optimiza renderizado
4. **Developer Experience**: Hot reload instantáneo
5. **Escalabilidad**: Fácil agregar nuevas features

## 📝 Notas

- El backend NO fue modificado, sigue funcionando igual
- Los estilos CSS originales se mantienen
- La API REST permanece intacta
- Compatible con la base de datos existente
