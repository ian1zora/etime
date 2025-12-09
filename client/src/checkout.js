// Checkout JavaScript
let orderData = {};
let cart = {};
let currentDiscount = { code: null, percent: 0 };

// Cargar datos del carrito
function loadCartData() {
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '{}');
        currentDiscount = JSON.parse(localStorage.getItem('discount') || '{"code":null,"percent":0}');
        const orderSummary = JSON.parse(localStorage.getItem('lastOrderSummary') || 'null');
        if (orderSummary) {
            displayOrderSummary(orderSummary);
        }
    } catch (error) {
        console.error('Error cargando datos del carrito:', error);
    }
}

// Mostrar resumen del pedido
async function displayOrderSummary(orderSummary) {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!orderSummary.items || orderSummary.items.length === 0) {
        orderItemsContainer.innerHTML = '<p>No hay items en el pedido</p>';
        return;
    }

    let subtotal = 0;
    let itemsHtml = '';

    orderSummary.items.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        itemsHtml += `
            <div class="summary-item">
                <span>${item.name} x${item.qty}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    orderItemsContainer.innerHTML = itemsHtml;

    // Calcular totales
    const discountAmount = subtotal * (currentDiscount.percent / 100);
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.21;
    const total = taxableAmount + tax;

    // Mostrar totales
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `-$${discountAmount.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;

    // Guardar datos para el pedido
    orderData = {
        items: orderSummary.items,
        subtotal: subtotal,
        discount: discountAmount,
        tax: tax,
        total: total,
        discountCode: currentDiscount.code
    };
}

// Validaciones
function validateForm() {
    const errors = {};
    
    // Validar campos requeridos
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    requiredFields.forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            errors[field] = 'Este campo es requerido';
        }
    });

    // Validar email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.email = 'Email inválido';
    }

    // Validar teléfono
    const phone = document.getElementById('phone').value.trim();
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
    if (phone && !phoneRegex.test(phone)) {
        errors.phone = 'Teléfono inválido';
    }

    // Validar método de pago
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) {
        errors.paymentMethod = 'Selecciona un método de pago';
    }

    // Validar datos de tarjeta si es necesario
    if (paymentMethod === 'tarjeta') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value.trim();

        if (!cardNumber || cardNumber.length < 13) {
            errors.cardNumber = 'Número de tarjeta inválido';
        }

        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
            errors.expiryDate = 'Formato inválido (MM/AA)';
        }

        if (!cvv || cvv.length < 3) {
            errors.cvv = 'CVV inválido';
        }

        if (!cardName) {
            errors.cardName = 'Nombre en la tarjeta requerido';
        }
    }

    return errors;
}

// Mostrar errores
function displayErrors(errors) {
    // Limpiar errores anteriores
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    // Mostrar nuevos errores
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    });
}

// Procesar pedido
async function processOrder(formData) {
    try {
        const orderPayload = {
            // Información del cliente
            customer: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
            },
            // Información de envío
            shipping: {
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                notes: formData.notes
            },
            // Información de pago
            payment: {
                method: formData.paymentMethod,
                cardData: formData.paymentMethod === 'tarjeta' ? {
                    number: formData.cardNumber,
                    expiryDate: formData.expiryDate,
                    cvv: formData.cvv,
                    name: formData.cardName
                } : null
            },
            // Datos del pedido
            order: {
                items: orderData.items.map(item => ({
                    producto_id: item.id,
                    cantidad: item.qty,
                    precio_unitario: item.price
                })),
                personas_mesa: 1,
                codigo_descuento: orderData.discountCode,
                notas: formData.notes
            }
        };

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });

        const result = await response.json();

        if (result.success) {
            // Limpiar carrito
            localStorage.removeItem('cart');
            localStorage.removeItem('discount');
            localStorage.removeItem('lastOrderSummary');
            
            // Redirigir a página de confirmación
            window.location.href = `/confirmation.html?order=${result.data.numero_pedido}`;
        } else {
            throw new Error(result.message || 'Error procesando el pedido');
        }

    } catch (error) {
        console.error('Error procesando pedido:', error);
        alert('Error procesando el pedido: ' + error.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();

    // Selección de método de pago
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            
            // Seleccionar actual
            this.classList.add('selected');
            document.getElementById('paymentMethod').value = this.dataset.method;

            // Mostrar/ocultar sección de tarjeta
            const cardSection = document.getElementById('card-section');
            if (this.dataset.method === 'tarjeta') {
                cardSection.style.display = 'block';
                // Hacer campos de tarjeta requeridos
                ['cardNumber', 'expiryDate', 'cvv', 'cardName'].forEach(field => {
                    document.getElementById(field).required = true;
                });
            } else {
                cardSection.style.display = 'none';
                // Remover requerimiento de campos de tarjeta
                ['cardNumber', 'expiryDate', 'cvv', 'cardName'].forEach(field => {
                    document.getElementById(field).required = false;
                });
            }
        });
    });

    // Formatear número de tarjeta
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Formatear fecha de expiración
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Formatear CVV
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // Submit del formulario
    document.getElementById('checkout-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return;
        }

        // Mostrar loading
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('loading').style.display = 'block';

        // Recopilar datos del formulario
        const formData = new FormData(this);
        const formObject = Object.fromEntries(formData.entries());

        try {
            await processOrder(formObject);
        } catch (error) {
            // Ocultar loading y mostrar formulario
            document.getElementById('loading').style.display = 'none';
            document.getElementById('checkout-form').style.display = 'block';
        }
    });
});