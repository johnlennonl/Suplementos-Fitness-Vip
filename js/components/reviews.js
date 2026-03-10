/**
 * Reviews Component
 * Suplementos Fitness VIP
 */

import { db } from '../firebase-config.js';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Open the Review Modal after purchase
 */
export function openReviewModal(items) {
    const modalHtml = `
        <div class="review-modal-overlay" id="review-modal">
            <div class="review-modal">
                <button class="review-close" id="close-review">&times;</button>
                <div class="review-header">
                    <div class="review-icon">🔥</div>
                    <h2>¡Pedido Registrado!</h2>
                    <p>Ya te hemos redirigido a WhatsApp. Mientras esperas la respuesta, ¿podrías darnos tu opinión?</p>
                </div>
                
                <div class="review-body">
                    <div class="review-products-summary">
                        <span>Realizaste tu pedido de:</span>
                        <p>${items.map(i => i.name).join(', ')}</p>
                    </div>

                    <div class="rating-stars" id="rating-stars">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>

                    <textarea id="review-comment" placeholder="Escribe tu opinión aquí... (Opcional)" maxlength="200"></textarea>
                    
                    <div class="review-actions">
                        <button class="submit-review-btn" id="submit-review">Enviar Opinión</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Animation
    setTimeout(() => {
        document.getElementById('review-modal').classList.add('active');
        if (typeof gsap !== 'undefined') {
            gsap.from('.review-modal', { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
        }
    }, 100);

    setupReviewEvents();
}

let selectedRating = 0;

function setupReviewEvents() {
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-review');
    const stars = document.querySelectorAll('#rating-stars i');
    const submitBtn = document.getElementById('submit-review');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 400);
    });

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            highlightStars(rating);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(selectedRating);
        });

        star.addEventListener('click', () => {
            selectedRating = star.dataset.rating;
            highlightStars(selectedRating);
        });
    });

    submitBtn.addEventListener('click', async () => {
        if (selectedRating === 0) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Por favor',
                    text: 'Selecciona una calificación con estrellas.',
                    icon: 'warning',
                    background: '#111',
                    color: '#fff'
                });
            } else {
                alert('Selecciona una calificación.');
            }
            return;
        }

        const comment = document.getElementById('review-comment').value.trim();

        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';

        try {
            await addDoc(collection(db, "reviews"), {
                rating: parseInt(selectedRating),
                comment: comment,
                createdAt: serverTimestamp(),
                approved: true // Auto-approved for now, or you can add moderation
            });

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: '¡Muchas Gracias!',
                    text: 'Tu opinión nos ayuda a seguir mejorando.',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#111',
                    color: '#fff'
                });
            } else {
                alert('¡Muchas gracias por tu opinión!');
            }

            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 400);

        } catch (error) {
            console.error("Error submitting review:", error);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Error al enviar',
                    text: 'Hubo un problema: ' + (error.message || 'Error desconocido'),
                    icon: 'error',
                    background: '#111',
                    color: '#fff'
                });
            } else {
                alert('Error al enviar: ' + error.message);
            }
            submitBtn.disabled = false;
            submitBtn.innerText = 'Enviar Opinión';
        }
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#rating-stars i');
    stars.forEach(s => {
        if (s.dataset.rating <= rating) {
            s.style.color = '#99ff00';
            s.classList.remove('far');
            s.classList.add('fas');
        } else {
            s.style.color = '#444';
            s.classList.remove('fas');
            s.classList.add('far');
        }
    });
}

/**
 * Init Testimonials on Landing Page
 */
export function initReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Aumentamos el límite a 15 para el carrusel
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(15));

    onSnapshot(q, (snapshot) => {
        const reviews = [];
        snapshot.forEach(doc => reviews.push(doc.data()));

        // Display ONLY if 3 or more reviews exist
        if (reviews.length >= 3) {
            container.style.display = 'block';
            renderReviews(container, reviews);
        } else {
            container.style.display = 'none';
        }
    });
}

function renderReviews(container, reviews) {
    const isCarousel = reviews.length >= 7;

    // Si es carrusel, duplicamos los items para el efecto infinito continuo
    const displayReviews = isCarousel ? [...reviews, ...reviews] : reviews.slice(0, 6);

    container.innerHTML = `
        <div class="reviews-wrapper">
            <h2 class="section-title">Opiniones de nuestros <span class="green">fieles clientes</span></h2>
            <div class="reviews-viewport ${isCarousel ? 'carousel-mode' : ''}">
                <div class="reviews-grid ${isCarousel ? 'carousel-track' : ''}">
                    ${displayReviews.map(rev => `
                        <div class="review-card">
                            <div class="review-stars">
                                ${Array(5).fill(0).map((_, i) => `<i class="${i < rev.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
                            </div>
                            <p class="review-text">"${rev.comment || '¡Excelente producto y atención!'}"</p>
                            <div class="review-author">Cliente Verificado</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Animation logic
    if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (isCarousel) {
            // Lógica de Carrusel Continuo Infinito
            const track = container.querySelector('.carousel-track');
            const cards = container.querySelectorAll('.review-card');

            // Calculamos el ancho total de la mitad de los elementos (el set original)
            const scrollWidth = track.scrollWidth / 2;

            gsap.to(track, {
                x: -scrollWidth,
                duration: 30, // Velocidad del carrusel
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % scrollWidth)
                }
            });

            // Pausar al pasar el mouse
            track.addEventListener('mouseenter', () => gsap.getTweensOf(track).forEach(t => t.pause()));
            track.addEventListener('mouseleave', () => gsap.getTweensOf(track).forEach(t => t.play()));

        } else {
            // Lógica de Cuadrícula Estática (GSAP Entrance)
            gsap.from(".review-card", {
                scrollTrigger: {
                    trigger: ".reviews-grid",
                    start: "top 85%",
                },
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => ScrollTrigger.refresh(), 500);
        }
    } else {
        // Fallback CSS
        document.querySelectorAll('.review-card').forEach(el => el.style.opacity = '1');
    }
}
