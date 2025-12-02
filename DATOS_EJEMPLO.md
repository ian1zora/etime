# 📋 DATOS DE EJEMPLO PARA CHECKOUT

## 🚀 Para probar el sistema completo:

### 1️⃣ **Información de Envío:**
```
Nombre: Juan
Apellido: Pérez
Email: juan.perez@email.com
Teléfono: +54 11 1234-5678
Dirección: Av. Corrientes 1234
Ciudad: Buenos Aires
Código Postal: 1043
Notas: Departamento 5B, timbre rojo
```

### 2️⃣ **Métodos de Pago Disponibles:**

**🟢 Efectivo** (Recomendado para pruebas)
- Seleccionar "Efectivo"
- No requiere datos adicionales

**💳 Tarjeta de Crédito/Débito:**
```
Número: 4532 1234 5678 9012
Fecha: 12/25
CVV: 123
Nombre: JUAN PEREZ
```

**🏦 Transferencia Bancaria**
- Seleccionar "Transferencia"
- No requiere datos adicionales

**📱 MercadoPago**
- Seleccionar "MercadoPago"
- No requiere datos adicionales

### 3️⃣ **Códigos de Descuento Válidos:**
```
PROMO10 = 10% de descuento
DESCUENTO20 = 20% de descuento
```

### 4️⃣ **Flujo de Prueba Completo:**

1. **Ir a:** `http://localhost:5000`
2. **Agregar productos** al carrito (máximo 4 items)
3. **Aplicar descuento** (opcional): PROMO10
4. **Hacer clic** en "Finalizar Compra"
5. **Completar formulario** con datos de arriba
6. **Seleccionar** método de pago (recomendado: Efectivo)
7. **Confirmar pedido**
8. **Ver confirmación** con número de pedido

### 5️⃣ **Productos Disponibles en la BD:**
- Ensalada César - $450.00 (Stock: 50)
- Empanadas de Carne - $150.00 (Stock: 100)
- Risotto de Hongos - $1200.00 (Stock: 30)
- Pizza Margherita - $950.00 (Stock: 25)
- Tiramisú - $550.00 (Stock: 20)
- Flan Casero - $450.00 (Stock: 30)
- Cerveza Artesanal - $350.00 (Stock: 100)
- Agua Mineral - $200.00 (Stock: 200)

### 6️⃣ **Validaciones del Sistema:**
- ✅ Máximo 4 items por persona
- ✅ Stock disponible
- ✅ Campos requeridos
- ✅ Formato de email válido
- ✅ Formato de teléfono válido
- ✅ Datos de tarjeta (si aplica)

### 7️⃣ **Después del Pedido:**
- 📧 Se genera número único de pedido
- 📦 Se reduce automáticamente el stock
- 💾 Se guarda en la base de datos
- 📄 Se muestra página de confirmación

---

## 🔧 **Si hay errores:**

1. **Verificar que el servidor esté corriendo:** `npm run dev`
2. **Verificar conexión a MySQL:** Revisar XAMPP
3. **Verificar que la BD existe:** `etime_restaurante`
4. **Revisar consola del navegador** para errores JavaScript

---

## 📞 **Soporte:**
Si encuentras algún problema, revisa la consola del navegador (F12) y la consola del servidor para ver los errores específicos.