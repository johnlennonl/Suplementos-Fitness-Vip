import { openReviewModal } from './reviews.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

export function addToCart(product) {
    const existing = cart.find(item =>
        item.id === product.id &&
        item.selectedFlavor === product.selectedFlavor &&
        item.selectedSize === product.selectedSize
    );

    if (existing) {
        existing.qty += product.qty;
    } else {
        cart.push(product);
    }

    saveCart();
    updateCartUI();

    // Animation instead of opening modal immediately
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '¡Producto añadido al carrito!',
            showConfirmButton: false,
            timer: 2000,
            background: '#111',
            color: '#fff',
            iconColor: '#99ff00'
        });
    }

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.cart-icon-nav',
            { scale: 1.5, color: '#99ff00' },
            { scale: 1, color: '#ffffff', duration: 0.5, ease: 'back.out(1.7)' }
        );
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

export function toggleCart(show) {
    const cartOverlay = document.getElementById('cart-sidebar-overlay');
    if (!cartOverlay) return;

    if (show) {
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.cart-modal', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
    } else {
        if (typeof gsap !== 'undefined') {
            gsap.to('.cart-modal', {
                scale: 0.95, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
                    cartOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        } else {
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

export function initCart() {
    // Create Cart Sidebar if not exists
    if (!document.getElementById('cart-sidebar-overlay')) {
        const cartHtml = `
            <div class="cart-modal-overlay" id="cart-sidebar-overlay">
                <div class="cart-modal">
                    <button class="cart-modal-close" id="close-cart-sidebar">&times;</button>
                    <div class="cart-modal-header">
                        <h2>Tu <span class="green">Carrito</span></h2>
                    </div>
                    
                    <div class="cart-modal-body" id="cart-items-container">
                        <!-- Items dynamicos -->
                    </div>

                    <div class="cart-modal-footer">
                        <div class="cart-total">
                            <span>Total Estimado:</span>
                            <span class="total-price" id="cart-total-price">$0.00</span>
                        </div>
                        <button class="checkout-btn" id="whatsapp-checkout">
                            <i class="fab fa-whatsapp"></i> Proceder al Pedido
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHtml);

        document.getElementById('close-cart-sidebar').addEventListener('click', () => toggleCart(false));
        document.getElementById('whatsapp-checkout').addEventListener('click', sendWhatsAppOrder);
    }

    // Styles are loaded via css/components/cart.css
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const cartCount = document.querySelectorAll('.cart-count'); // Para el nav

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-msg">Tu carrito está vacío. ¡Empieza a entrenar duro! 💪</div>`;
        totalEl.innerText = '$0.00';
    } else {
        let total = 0;
        container.innerHTML = cart.map((item, idx) => {
            total += (item.price * item.qty);
            return `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-options">${item.selectedFlavor ? `Sabor: ${item.selectedFlavor}` : ''}</p>
                        <div class="item-price-qty">
                            <span>${item.qty} x $${parseFloat(item.price).toFixed(2)}</span>
                            <button class="remove-item" onclick="removeFromCart(${idx})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        totalEl.innerText = `$${total.toFixed(2)}`;
    }

    // Update nav counters
    cartCount.forEach(el => {
        el.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
        el.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

function sendWhatsAppOrder() {
    if (cart.length === 0) return;

    let total = 0;
    let message = "🔥 *NUEVO PEDIDO - FITNESS VIP* 🔥\n\n";
    message += "Hola, me interesa comprar los siguientes suplementos:\n\n";

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `✅ *${item.name}*\n`;
        if (item.selectedFlavor) message += `   ▫️ Sabor: ${item.selectedFlavor}\n`;
        message += `   ▫️ Cantidad: ${item.qty}\n`;
        message += `   ▫️ Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });

    message += `💰 *TOTAL A PAGAR: $${total.toFixed(2)}*\n\n`;
    message += "Espero tu respuesta para coordinar la entrega. ¡Gracias! 🚀";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/584126581304?text=${encodedMessage}`;

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¡Completa tu compra con nosotros!',
            text: 'Serás redirigido a WhatsApp para finalizar tu pedido con un asesor.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#99ff00',
            cancelButtonColor: '#333',
            confirmButtonText: '<span style="color:black; font-weight:bold;">Ir a WhatsApp <i class="fab fa-whatsapp"></i></span>',
            cancelButtonText: 'Cancelar',
            background: '#111',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                const itemsForReview = [...cart];
                cart = [];
                saveCart();
                updateCartUI();
                toggleCart(false);
                window.open(whatsappUrl, '_blank');

                // Show review modal after a short delay
                setTimeout(() => {
                    openReviewModal(itemsForReview);
                }, 2000);
            }
        });
    } else {
        // Fallback en caso de que Swal no esté cargado
        if (confirm("¡Completa tu compra con nosotros! Serás redirigido a WhatsApp para finalizar tu pedido.")) {
            const itemsForReview = [...cart];
            cart = [];
            saveCart();
            updateCartUI();
            toggleCart(false);
            window.open(whatsappUrl, '_blank');

            setTimeout(() => {
                openReviewModal(itemsForReview);
            }, 2000);
        }
    }
}
