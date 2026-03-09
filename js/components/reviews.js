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
            }

            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 400);

        } catch (error) {
            console.error("Error submitting review:", error);
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

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(6));

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
    // Only show top 3 for the specific request, or loop through if more
    const topReviews = reviews.slice(0, 3);

    container.innerHTML = `
        <div class="reviews-wrapper reveal">
            <h2 class="section-title">Opiniones de nuestros <span class="green">fieles clientes</span></h2>
            <div class="reviews-grid">
                ${topReviews.map(rev => `
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
    `;

    // Animation if GSAP is available
    if (typeof gsap !== 'undefined') {
        gsap.to(".review-card", {
            scrollTrigger: {
                trigger: ".reviews-grid",
                start: "top 80%",
            },
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
        });
    }
}
