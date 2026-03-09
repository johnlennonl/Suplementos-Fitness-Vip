import { db } from '../firebase-config.js';
import { collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showProductDetail } from './product-detail.js';

export function initProducts() {
    const productsContainer = document.getElementById("products-container");
    const categoriesContainer = document.getElementById("categories-container");

    renderCategories(categoriesContainer);
    renderProducts(productsContainer);
    setupStyles();
}

function renderCategories(container) {
    const categories = [
        "Todos",
        "Pre-entreno",
        "Creatinas",
        "Proteínas",
        "Aminoácidos",
    ];

    container.innerHTML = `
        <div class="categories-wrapper reveal">
            <h2 class="section-title">Nuestras <span class="green">Categorías</span></h2>
            <div class="category-list">
                ${categories.map((cat) => `<button class="category-btn ${cat === "Todos" ? "active" : ""}" data-category="${cat}">${cat}</button>`).join("")}
            </div>
        </div>
    `;

    // Category Filter Logic
    const btns = container.querySelectorAll(".category-btn");
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            btns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            filterProducts(btn.dataset.category);
        });
    });

    // Animate categories
    gsap.to(".categories-wrapper", {
        scrollTrigger: {
            trigger: ".categories-wrapper",
            start: "top 90%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
    });
}

function renderProducts(container, filter = "Todos") {
    // Escuchar cambios en tiempo real desde Firestore
    const q = query(collection(db, "products"), orderBy("name", "asc"));

    onSnapshot(q, (snapshot) => {
        let products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        const filtered = filter === "Todos" ? products : products.filter((p) => p.category === filter);

        if (filtered.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 100px; color: #666; font-weight: 600;">No hay productos disponibles en esta categoría.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="product-grid">
                ${filtered
                .map(
                    (product) => {
                        const lowStock = product.stock > 0 && product.stock <= 4;
                        return `
                        <div class="product-card reveal">
                            <div class="product-img">
                                <img src="${product.img}" alt="${product.name}" class="p-img">
                                <div class="product-badge">${product.category}</div>
                                ${lowStock ? `<div class="low-stock-badge">⚠️ QUEDAN POCOS</div>` : ""}
                                ${product.stock <= 0 ? `<div class="out-of-stock-badge">AGOTADO</div>` : ""}
                            </div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                                <button class="view-btn">Ver Producto</button>
                            </div>
                        </div>
                    `}
                )
                .join("")}
            </div>
        `;
        // Add click listeners to open product detail view
        // The 'encodedMessage' variable is not defined in this scope.
        // Assuming this line is intended to be part of a larger change or a placeholder.
        // For now, it's commented out to maintain syntactical correctness.
        // const whatsappUrl = `https://wa.me/584126581304?text=${encodedMessage}`;
        const cards = container.querySelectorAll('.product-card');
        cards.forEach((card, idx) => {
            const product = filtered[idx];
            card.addEventListener('click', (e) => {
                showProductDetail(product);
            });
        });
        // Animate new cards with ScrollTrigger
        gsap.to(".product-card", {
            scrollTrigger: {
                trigger: ".product-grid",
                start: "top 80%",
            },
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
        });
    });
}

function filterProducts(category) {
    const productsContainer = document.getElementById("products-container");
    renderProducts(productsContainer, category);
}

function setupStyles() {
    const styles = `
        .section-title {
            font-size: 2.5rem;
            margin-bottom: 40px;
            text-align: center;
        }

        .categories-wrapper {
            max-width: 1200px;
            margin: 0 auto;
        }

        .category-list {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }

        .category-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 12px 25px;
            border-radius: 100px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: var(--transition-smooth);
        }

        .category-btn:hover, .category-btn.active {
            background: var(--primary-color);
            color: black;
            border-color: var(--primary-color);
            box-shadow: 0 0 15px var(--accent-glow);
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .product-card {
            background: var(--card-bg);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.05);
            transition: var(--transition-smooth);
            position: relative;
        }

        .product-card:hover {
            transform: translateY(-10px);
            border-color: var(--primary-color);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .product-img {
            height: 250px;
            background: #111;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 20px;
        }

        .p-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: var(--transition-smooth);
        }

        .product-card:hover .p-img {
            transform: scale(1.1);
        }

        .product-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: var(--primary-color);
            color: black;
            font-size: 10px;
            font-weight: 900;
            padding: 5px 12px;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .product-info {
            padding: 25px;
            text-align: center;
        }

        .product-info h3 {
            font-size: 1.2rem;
            margin-bottom: 10px;
            letter-spacing: 0;
        }

        .product-info .price {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 20px;
        }

        .view-btn {
            display: block;
            width: 100%;
            padding: 12px;
            background: var(--primary-color);
            border: 1px solid var(--primary-color);
            color: black;
            text-transform: uppercase;
            font-weight: 800;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: var(--transition-smooth);
        }

        .view-btn:hover {
            background: white;
            color: black;
            border-color: white;
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .low-stock-badge {
            position: absolute;
            bottom: 15px;
            right: 15px;
            background: #ff4444;
            color: white;
            font-size: 10px;
            font-weight: 900;
            padding: 5px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            animation: pulse-red 2s infinite;
        }

        .out-of-stock-badge {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            background: rgba(0,0,0,0.8);
            color: white;
            border: 2px solid #ff4444;
            padding: 10px 20px;
            font-size: 1.5rem;
            font-weight: 900;
            z-index: 5;
            pointer-events: none;
        }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
        }

        /* Detail view changes */
        .pm-stock-warning {
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid #ff4444;
            color: #ff4444;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            text-align: center;
        }

        .pm-stock-out {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #666;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            text-align: center;
            text-transform: uppercase;
        }

        .pm-add-btn:disabled {
            background: #222;
            color: #444;
            cursor: not-allowed;
            box-shadow: none;
            transform: none !important;
        }
    `;

    const head = document.head;
    const style = document.createElement("style");
    style.textContent = styles;
    head.appendChild(style);
}
