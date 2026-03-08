/**
 * Product Detail Component
 * Suplementos Fitness VIP
 */

import { addToCart } from "./cart.js";

export function showProductDetail(product) {
    const detailOverlay = document.createElement("div");
    detailOverlay.className = "pm-overlay";
    detailOverlay.id = "product-detail-view";

    // Fallback if images array doesn't exist
    const images =
        product.images && product.images.length > 0
            ? product.images
            : [product.img];
    const flavors = product.flavors || [];

    // Styles are loaded via css/components/product-detail.css

    // Calculamos un supuesto precio original (+20% por estética)
    const oldPrice = parseFloat(product.price) * 1.2;

    detailOverlay.innerHTML = `
        <div class="pm-container">
            <button class="pm-close" id="close-detail">&times;</button>
            
            <div class="pm-gallery">
                <div class="pm-thumbnails">
                    ${images
            .map(
                (img, idx) => `
                        <div class="pm-thumb ${idx === 0 ? "active" : ""}" data-index="${idx}">
                            <img src="${img}" alt="Vista ${idx + 1}">
                        </div>
                    `,
            )
            .join("")}
                </div>
                <div class="pm-main-img-container">
                    <img src="${images[0]}" id="main-detail-img" alt="${product.name}">
                </div>
            </div>

            <div class="pm-info">
                <div class="pm-stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                    <span>(521 opiniones)</span>
                </div>
                
                <h1 class="pm-title">${product.name}</h1>
                <p class="pm-desc">${product.description || "Apoya los procesos de desarrollo y recuperación muscular."}</p>
                
                <div class="pm-benefits">
                    <div class="pm-benefit">RECUPERACIÓN<br>MUSCULAR<br>RÁPIDA</div>
                    <div class="pm-benefit">DESARROLLO<br>MUSCULAR<br>MAGRO</div>
                    <div class="pm-benefit">REDUCCIÓN DE<br>LA FATIGA<br>MUSCULAR</div>
                </div>

                <div class="pm-price-block">
                    <span class="pm-price-old">$${oldPrice.toFixed(2)}</span>
                    <span class="pm-price">$${parseFloat(product.price).toFixed(2)}</span>
                </div>

                ${flavors.length > 0
            ? `
                    <div class="pm-section">
                        <span class="pm-label">Sabores</span>
                        <select class="pm-select" id="pm-flavor-select">
                            ${flavors.map((f) => `<option value="${f}">${f}</option>`).join("")}
                        </select>
                    </div>
                `
            : ""
        }

                <div class="pm-section">
                    <span class="pm-label">Tamaño</span>
                    <select class="pm-select" id="pm-size-select">
                        ${product.sizes && product.sizes.length > 0
            ? product.sizes.map(s => `<option value="${s.price}">${s.label}</option>`).join("")
            : `<option value="${product.price}">Porción Única</option>`
        }
                    </select>
                </div>

                <div class="pm-actions">
                    <div class="pm-qty">
                        <button id="qty-minus">-</button>
                        <span id="qty-value">1</span>
                        <button id="qty-plus">+</button>
                    </div>
                    <button class="pm-add-btn" id="add-to-cart-action">
                        AÑADIR AL CARRITO • $<span id="btn-total-price">${parseFloat(product.price).toFixed(2)}</span>
                    </button>
                </div>

                <div class="pm-badges">
                    <div class="pm-badge-item">
                        <i class="fas fa-flag-usa"></i>
                        Fabricado<br>en EE. UU.
                    </div>
                    <div class="pm-badge-item">
                        <i class="fas fa-box"></i>
                        Envío Gratis<br>por más de $99
                    </div>
                    <div class="pm-badge-item">
                        <i class="fas fa-shield-alt"></i>
                        Garantía<br>de 30 días
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(detailOverlay);
    document.body.style.overflow = "hidden";

    // Animación de entrada
    gsap.from(".pm-container", {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
    });

    setupDetailEvents(product, images);
}

function setupDetailEvents(product, images) {
    const closeBtn = document.getElementById("close-detail");
    const thumbs = document.querySelectorAll(".pm-thumb");
    const mainImg = document.getElementById("main-detail-img");
    const qtyMinus = document.getElementById("qty-minus");
    const qtyPlus = document.getElementById("qty-plus");
    const qtyValue = document.getElementById("qty-value");
    const addToCartBtn = document.getElementById("add-to-cart-action");
    const btnTotalPrice = document.getElementById("btn-total-price");
    const flavorSelect = document.getElementById("pm-flavor-select");
    const sizeSelect = document.getElementById("pm-size-select");
    const mainPriceLabel = document.querySelector(".pm-info .pm-price");
    const oldPriceLabel = document.querySelector(".pm-info .pm-price-old");

    let currentQty = 1;
    let currentBasePrice = sizeSelect ? parseFloat(sizeSelect.value) : parseFloat(product.price);

    closeBtn.addEventListener("click", () => {
        gsap.to(".pm-container", {
            scale: 0.95,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                document.getElementById("product-detail-view").remove();
                document.body.style.overflow = "";
            },
        });
    });

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            thumbs.forEach((t) => t.classList.remove("active"));
            thumb.classList.add("active");
            const idx = thumb.dataset.index;

            gsap.to(mainImg, {
                opacity: 0.5,
                duration: 0.15,
                onComplete: () => {
                    mainImg.src = images[idx];
                    gsap.to(mainImg, { opacity: 1, duration: 0.2 });
                },
            });
        });
    });

    const updatePrice = () => {
        const total = (currentBasePrice * currentQty).toFixed(2);
        btnTotalPrice.innerText = total;
        if (mainPriceLabel) {
            mainPriceLabel.innerText = `$${currentBasePrice.toFixed(2)}`;
        }
        if (oldPriceLabel) {
            const oldVal = (currentBasePrice * 1.2).toFixed(2);
            oldPriceLabel.innerText = `$${oldVal}`;
        }
    };

    if (sizeSelect) {
        sizeSelect.addEventListener("change", (e) => {
            currentBasePrice = parseFloat(e.target.value);
            updatePrice();
        });
    }

    qtyMinus.addEventListener("click", () => {
        if (currentQty > 1) {
            currentQty--;
            qtyValue.innerText = currentQty;
            updatePrice();
        }
    });

    qtyPlus.addEventListener("click", () => {
        currentQty++;
        qtyValue.innerText = currentQty;
        updatePrice();
    });

    // Carga inicial de precio
    updatePrice();

    addToCartBtn.addEventListener("click", () => {
        const selectedFlavor = flavorSelect ? flavorSelect.value : null;
        const selectedSize = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex].text : "Porción Única";

        addToCart({
            ...product,
            price: currentBasePrice,
            qty: currentQty,
            selectedFlavor: selectedFlavor,
            selectedSize: selectedSize
        });
        closeBtn.click();
    });
}
