/**
 * Main JS Entry Point
 * Suplementos Fitness VIP
 */

import { initNav } from './components/nav.js';
import { initHero } from './components/hero.js';
import { initProducts } from './components/products.js';
import { initCart } from './components/cart.js';
import { initFooter } from './components/footer.js';
import { initContactAnimations } from './components/contact.js';

document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Components
    initNav();
    initHero();
    initProducts();
    initCart();
    initFooter();
    initContactAnimations();

    // Global Scroll Functionalities
    handleGlobalScroll();
});

function handleGlobalScroll() {
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // Show/Hide Back to Top Button
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
