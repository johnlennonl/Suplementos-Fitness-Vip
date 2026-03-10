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
import { initBackground } from './components/background.js';
import { initSmoothScroll } from './utils/smooth-scroll.js';
import { initReviews } from './components/reviews.js';
import { initTheme } from './components/theme.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Smooth Scroll (Lenis)
    initSmoothScroll();

    // Initialize Background Mesh
    initBackground();

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Components
    initNav();
    initTheme(); // Must come after initNav
    initHero();
    initProducts();
    initCart();
    initFooter();
    initContactAnimations();
    initReviews();

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
