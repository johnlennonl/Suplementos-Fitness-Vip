/**
 * Navigation Component
 * Suplementos Fitness VIP
 */

import { toggleCart } from './cart.js';

export function initNav() {
    const navContainer = document.getElementById('nav-container');

    const navHTML = `
        <nav class="main-nav">
            <div class="nav-content">
                <div class="logo">
                    <span class="logo-text">FITNESS<span class="highlight">VIP</span></span>
                </div>
                
                <ul class="nav-links">
                    <li><a href="#hero-container" class="active">Inicio</a></li>
                    <li><a href="#products-container">Productos</a></li>
                    <li><a href="#footer-container">Contacto</a></li>
                </ul>

                <div class="nav-actions">
                    <button class="cart-icon-nav" id="nav-cart-btn" aria-label="Ver Carrito">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count" style="display: none;">0</span>
                    </button>
                    <a href="login.html" class="admin-link" title="Admin Panel">
                        <i class="fas fa-user-shield"></i>
                    </a>
                    <button class="mobile-menu-toggle" aria-label="Abrir menú">
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </nav>
        <div class="mobile-menu">
            <ul class="mobile-nav-links">
                <li><a href="#hero-container">Inicio</a></li>
                <li><a href="#products-container">Productos</a></li>
                <li><a href="#footer-container">Contacto</a></li>
            </ul>
        </div>
    `;

    navContainer.innerHTML = navHTML;

    // Styles are now in css/components/nav.css
    setupNavEvents();
}

function setupNavEvents() {
    const nav = document.querySelector('.main-nav');

    // Scroll Event
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Toggle
    const toggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (toggle) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Cart Toggle
    const cartBtn = document.getElementById('nav-cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            toggleCart(true);
        });
    }
}


