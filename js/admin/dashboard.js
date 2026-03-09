/**
 * Dashboard Logic
 * Suplementos Fitness VIP
 */

import { db, auth } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    getDoc,
    orderBy,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// State Management
let saleCart = [];
let allProducts = [];
let currentSalesList = [];

// DOM Elements
const saleModal = document.getElementById('sale-modal');
const closeSaleModalBtn = document.getElementById('close-sale-modal');
const cancelSaleBtn = document.getElementById('cancel-sale');

// Check Auth Status
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        initDashboard();
    }
});

// Logout
const logoutBtn = document.getElementById('logout-btn-sidebar');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    });
}

function initDashboard() {
    loadInventory();
    setupAddForm();
    setupSizeRowLogic();
    loadSalesHistory();
}

// Counter Animation with Easing
function animateValue(id, start, end, duration, prefix = '', isPrice = false) {
    const obj = document.getElementById(id);
    if (!obj) return;

    const range = end - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) {
            startTime = timestamp;
            console.log(`Iniciando animación de conteo para: ${id} (${start} -> ${end})`);
        }
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // Easing: easeOutQuad
        const t = progress;
        const easedProgress = t * (2 - t);

        const current = start + (range * easedProgress);

        if (isPrice) {
            obj.innerText = prefix + current.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else {
            obj.innerText = prefix + Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Final exact value
            if (isPrice) {
                obj.innerText = prefix + end.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            } else {
                obj.innerText = prefix + end.toLocaleString();
            }
        }
    }
    window.requestAnimationFrame(step);
}

let lastStats = { count: 0, val: 0, low: 0, totalSales: 0 };

function setupSizeRowLogic() {
    const addBtn = document.getElementById('add-size-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => addSizeRow());
    }
}

window.addSizeRow = function (label = '', price = '') {
    const container = document.getElementById('sizes-container');
    const row = document.createElement('div');
    row.className = 'size-row';
    row.innerHTML = `
        <input type="text" class="size-label" placeholder="Nombre (ej: 60 Serv)" value="${label}" required>
        <input type="number" step="0.01" class="size-price" placeholder="Precio" value="${price}" required>
        <button type="button" class="remove-size-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
};

function loadInventory() {
    const q = query(collection(db, "products"), orderBy("name", "asc"));

    onSnapshot(q, (snapshot) => {
        const inventoryBody = document.getElementById('dashboard-inventory-body');
        if (!inventoryBody) return;

        let products = [];
        let totalVal = 0;
        let lowStock = 0;
        allProducts = []; // RE-LOAD products for sale modal

        inventoryBody.innerHTML = '';

        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            const product = { id, ...p };
            products.push(product);
            allProducts.push(product);

            // Stats
            totalVal += (p.price * p.stock);
            if (p.stock <= 4) lowStock++;

            const statusClass = p.stock <= 4 ? 'stock-low' : 'stock-ok';
            const statusText = p.stock <= 4 ? 'Quedan Pocos' : (p.stock <= 0 ? 'Agotado' : 'Disponible');

            inventoryBody.innerHTML += `
                <tr class="${p.stock <= 4 ? 'row-warning' : ''}">
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td class="green">$${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                        <div class="stock-control">
                            <button onclick="changeStock('${id}', ${p.stock}, -1)"><i class="fas fa-minus"></i></button>
                            <span class="${p.stock <= 4 ? 'text-red highlight-stock' : ''}">${p.stock}</span>
                            <button onclick="changeStock('${id}', ${p.stock}, 1)"><i class="fas fa-plus"></i></button>
                        </div>
                    </td>
                    <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                    <td class="action-btns">
                        <button class="action-btn sell-btn" title="Registrar Venta" onclick="sellProductGlobal('${id}', ${p.stock})">
                            <i class="fas fa-cart-arrow-down"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="openEditModal('${id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteProductFirestore('${id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        updateStats(products.length, totalVal, lowStock);
    });
}

window.sellProductGlobal = async function (id, currentStock) {
    if (currentStock <= 0) {
        Swal.fire({
            title: 'Sin Stock',
            text: 'No puedes vender un producto agotado.',
            icon: 'error',
            background: '#111',
            color: '#fff'
        });
        return;
    }

    const { isConfirmed } = await Swal.fire({
        title: 'Registrar Venta',
        text: '¿Deseas descontar 1 unidad del stock?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#99ff00',
        cancelButtonColor: '#ff4444',
        confirmButtonText: 'Sí, vender',
        background: '#111',
        color: '#fff'
    });

    if (isConfirmed) {
        try {
            await updateDoc(doc(db, "products", id), {
                stock: currentStock - 1
            });
            Swal.fire({
                title: 'Venta Registrada',
                icon: 'success',
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#111',
                color: '#fff'
            });
        } catch (error) {
            console.error("Error al registrar venta:", error);
        }
    }
};

/**
 * Advanced Sales System Logic
 */

// Section Navigation
document.querySelectorAll('#dashboard-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;

        document.querySelectorAll('#dashboard-menu a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        if (section === 'inventory') {
            document.getElementById('section-inventory').style.display = 'block';
            document.getElementById('section-sales').style.display = 'none';
        } else {
            document.getElementById('section-inventory').style.display = 'none';
            document.getElementById('section-sales').style.display = 'block';
            loadSalesHistory();
        }
    });
});

// Sale Modal Control
if (closeSaleModalBtn) closeSaleModalBtn.onclick = () => saleModal.style.display = 'none';
if (cancelSaleBtn) cancelSaleBtn.onclick = () => saleModal.style.display = 'none';

window.openSaleModal = function () {
    if (!saleModal) return;
    saleModal.style.display = 'block';
    saleCart = [];
    updateSaleCartUI();
    loadProductOptions();
};

async function loadProductOptions() {
    const select = document.getElementById('sale-product-select');
    select.innerHTML = '<option value="">Seleccionar producto...</option>';

    // allProducts is already loaded in loadInventory
    allProducts.forEach(p => {
        if (p.stock > 0) {
            select.innerHTML += `<option value="${p.id}">${p.name} ($${p.price}) - Stock: ${p.stock}</option>`;
        }
    });
}

window.addToSaleCart = function () {
    const select = document.getElementById('sale-product-select');
    const productId = select.value;
    if (!productId) return;

    const product = allProducts.find(p => p.id === productId);
    const existing = saleCart.find(item => item.id === productId);

    if (existing) {
        if (existing.qty < product.stock) {
            existing.qty++;
        } else {
            Swal.fire('Stock insuficiente', '', 'warning');
        }
    } else {
        saleCart.push({ ...product, qty: 1 });
    }

    updateSaleCartUI();
};

function updateSaleCartUI() {
    const container = document.getElementById('sale-items-list');
    const totalDisplay = document.getElementById('sale-total-display');
    if (!container || !totalDisplay) return;

    let total = 0;

    if (saleCart.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555; font-size:13px;">No hay productos añadidos</div>`;
        totalDisplay.innerText = `$0.00`;
        return;
    }

    container.innerHTML = saleCart.map((item, idx) => {
        total += (item.price * item.qty);
        return `
            <div class="sale-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border: 1px solid rgba(153, 255, 0, 0.1); background:rgba(0,0,0,0.5); margin-bottom:8px; border-radius:12px; position:relative; overflow:hidden;">
                <div style="position:absolute; left:0; top:0; width:4px; height:100%; background:var(--primary-color);"></div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <span style="font-weight:900; color:#fff; font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">${item.name}</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:var(--primary-color); font-size:12px; font-weight:900; background:rgba(153, 255, 0, 0.1); padding:2px 8px; border-radius:4px;">x${item.qty}</span>
                        <span style="color:#888; font-size:12px;">$${item.price.toFixed(2)} c/u</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <span style="font-weight:900; color:white; font-size:16px;">$${(item.price * item.qty).toFixed(2)}</span>
                    <button type="button" class="remove-item-btn" onclick="removeFromSaleCart(${idx})" style="background:#ff4444; border:none; color:black; width:32px; height:32px; border-radius:8px; cursor:pointer; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(255, 68, 68, 0.2);">
                        <i class="fas fa-trash-alt" style="font-size:12px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    totalDisplay.innerText = `$${total.toFixed(2)}`;
}

window.removeFromSaleCart = function (idx) {
    saleCart.splice(idx, 1);
    updateSaleCartUI();
};

window.checkOtherPayment = function (select) {
    const otherInput = document.getElementById('sale-payment-other');
    if (select.value === 'Otro') {
        otherInput.style.display = 'block';
        otherInput.required = true;
        otherInput.focus();
    } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
    }
};

// Form Submission
document.getElementById('sale-form').onsubmit = async (e) => {
    e.preventDefault();
    if (saleCart.length === 0) {
        Swal.fire('Error', 'El carrito de venta está vacío', 'error');
        return;
    }

    const customerName = document.getElementById('sale-customer-name').value;
    const customerPhone = document.getElementById('sale-customer-phone').value;
    const type = document.getElementById('sale-type').value;
    const paymentBase = document.getElementById('sale-payment').value;
    const payment = paymentBase === 'Otro' ? document.getElementById('sale-payment-other').value : paymentBase;

    const invoiceId = 'FACT-' + Math.floor(Math.random() * 90000 + 10000);
    const total = saleCart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const saleData = {
        invoiceId,
        customerName,
        customerPhone,
        type,
        paymentMethod: payment,
        items: saleCart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        total,
        createdAt: serverTimestamp()
    };

    try {
        // 1. Save Sale
        await addDoc(collection(db, "sales"), saleData);

        // 2. Update Stock for each product
        for (const item of saleCart) {
            const productRef = doc(db, "products", item.id);
            await updateDoc(productRef, {
                stock: increment(-item.qty)
            });
        }

        Swal.fire({
            title: 'Venta Registrada',
            text: `Factura #${invoiceId} creada con éxito.`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '<i class="fab fa-whatsapp"></i> Compartir Factura',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#25D366'
        }).then((result) => {
            if (result.isConfirmed) {
                shareInvoiceWhatsApp(saleData);
            }
        });

        saleModal.style.display = 'none';
        document.getElementById('sale-form').reset();

    } catch (error) {
        console.error("Error registrando venta:", error);
        Swal.fire('Error', 'No se pudo registrar la venta', 'error');
    }
};

// Historial y WhatsApp
async function loadSalesHistory() {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const container = document.getElementById('sales-history-body');

    onSnapshot(q, (snapshot) => {
        container.innerHTML = '';
        let totalRevenue = 0;
        currentSalesList = [];

        snapshot.forEach((doc) => {
            const sale = { id: doc.id, ...doc.data() };
            currentSalesList.push(sale);
            totalRevenue += sale.total;
            const date = sale.createdAt ? sale.createdAt.toDate().toLocaleDateString() : 'Procesando...';
            const saleIdx = currentSalesList.length - 1;

            container.innerHTML += `
                <tr>
                    <td><strong>#${sale.invoiceId}</strong></td>
                    <td>${date}</td>
                    <td>${sale.customerName}<br><small>${sale.customerPhone}</small></td>
                    <td>${sale.items.length} productos</td>
                    <td><span class="status-tag stock-ok">${sale.paymentMethod}</span></td>
                    <td class="green">$${sale.total.toFixed(2)}</td>
                    <td class="action-btns">
                        <button class="action-btn edit-btn" onclick="showSaleDetails(${saleIdx})" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn wa-btn" onclick="shareInvoiceByIdx(${saleIdx})" title="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        // Actualizar Ventas Totales en Dashboard con dinero REAL
        if (totalRevenue !== lastStats.totalSales) {
            animateValue('total-sales', lastStats.totalSales, totalRevenue, 1500, '$', true);
            lastStats.totalSales = totalRevenue;
        }
    });
}

window.showSaleDetails = function (idx) {
    const sale = currentSalesList[idx];
    if (!sale) return;

    const modal = document.getElementById('sale-details-modal');

    // Header & Info
    document.getElementById('detail-invoice-id').innerText = `#${sale.invoiceId}`;
    const dateStr = sale.createdAt ? sale.createdAt.toDate().toLocaleString() : 'En proceso...';
    document.getElementById('detail-date').innerText = dateStr;
    document.getElementById('detail-customer-name').innerText = sale.customerName;
    document.getElementById('detail-customer-phone').innerText = sale.customerPhone;

    // Items
    const list = document.getElementById('detail-items-list');
    list.innerHTML = sale.items.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.01); border-radius:8px;">
            <div>
                <span style="display:block; font-weight:700; color:#fff;">${item.name}</span>
                <span style="font-size:12px; color:#888;">x${item.qty} (${item.price.toFixed(2)} c/u)</span>
            </div>
            <span style="font-weight:900; color:#fff;">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');

    // Footer Info
    document.getElementById('detail-payment-method').innerText = sale.paymentMethod;
    document.getElementById('detail-sale-type').innerText = sale.type || 'Tienda';
    document.getElementById('detail-total').innerText = `$${sale.total.toFixed(2)}`;

    // Re-share WA Button
    document.getElementById('re-share-wa').onclick = () => shareInvoiceWhatsApp(sale);

    modal.style.display = 'block';
};

// Details Modal Close
const detailsModal = document.getElementById('sale-details-modal');
const closeDetailsBtn = document.getElementById('close-details-modal');
if (closeDetailsBtn) {
    closeDetailsBtn.onclick = () => detailsModal.style.display = 'none';
}

window.shareInvoiceByIdx = function (idx) {
    const sale = currentSalesList[idx];
    if (sale) shareInvoiceWhatsApp(sale);
};

window.shareInvoiceWhatsApp = function (sale) {
    if (!sale || !sale.items) return;

    // Create a plain text message first
    const itemsText = sale.items.map(i => `▫️ ${i.name} x${i.qty} - $${(i.price * i.qty).toFixed(2)}`).join('\n');
    let message = `🔥 *FITNESS VIP - RECIBO DE COMPRA* 🔥\n\n`;
    message += `Hola *${sale.customerName}*, gracias por preferirnos. Aquí tienes el detalle de tu compra:\n\n`;
    message += `📑 *Factura:* #${sale.invoiceId}\n`;
    message += `📅 *Fecha:* ${new Date().toLocaleDateString()}\n`;
    message += `💳 *Método de Pago:* ${sale.paymentMethod}\n`;
    message += `📍 *Tipo:* ${sale.type || 'Tienda'}\n\n`;
    message += `📦 *Productos:* \n${itemsText}\n\n`;
    message += `💰 *TOTAL PAGADO: $${sale.total.toFixed(2)}*\n\n`;
    message += `¡A darle con todo al entrenamiento! 🚀👟🔥`;

    const rawPhone = sale.customerPhone.replace(/[^0-9]/g, '');
    let finalPhone = rawPhone;
    if (rawPhone.length === 10 && rawPhone.startsWith('4')) {
        finalPhone = '58' + rawPhone;
    } else if (rawPhone.length === 11 && rawPhone.startsWith('04')) {
        finalPhone = '58' + rawPhone.substring(1);
    } else if (!finalPhone.startsWith('58') && finalPhone.length > 0) {
        finalPhone = '58' + finalPhone;
    }

    // Encode the entire message properly
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
};


function updateStats(count, val, low) {
    if (count !== lastStats.count) {
        animateValue('total-products', lastStats.count, count, 1500);
        lastStats.count = count;
    }
    // Nota: total-sales se maneja en loadSalesHistory para mayor precisión con ventas reales
    if (low !== lastStats.low) {
        animateValue('low-stock-count', lastStats.low, low, 1500);
        lastStats.low = low;
    }
}

// Global scope for onclick
window.deleteProductFirestore = async function (id) {
    if (confirm('¿Eliminar este producto de la base de datos?')) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (error) {
            alert("Error al eliminar el producto");
        }
    }
};

function setupAddForm() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pId = document.getElementById('p-id').value;

        // Procesar sabores como array
        const flavorsRaw = document.getElementById('p-flavors').value;
        const flavors = flavorsRaw ? flavorsRaw.split(',').map(f => f.trim()).filter(f => f !== "") : [];

        const mainPrice = parseFloat(document.getElementById('p-price').value) || 0;

        // Procesar tamaños/porciones desde las filas dinámicas
        const sizeRows = document.querySelectorAll('.size-row');
        const sizes = Array.from(sizeRows).map(row => ({
            label: row.querySelector('.size-label').value.trim(),
            price: parseFloat(row.querySelector('.size-price').value) || mainPrice
        })).filter(s => s.label !== "");

        // Procesar imágenes como array (una por línea)
        const imagesRaw = document.getElementById('p-images').value;
        const images = imagesRaw.split('\n').map(i => i.trim()).filter(i => i !== "");

        const productData = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            flavors: flavors,
            sizes: sizes,
            description: document.getElementById('p-description').value,
            images: images,
            img: images[0] || ""
        };

        try {
            if (pId) {
                // Update Product
                await updateDoc(doc(db, "products", pId), productData);
                Swal.fire({
                    title: 'Producto Actualizado',
                    icon: 'success',
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#111',
                    color: '#fff',
                    iconColor: '#0099ff'
                });
            } else {
                // Add Product
                productData.createdAt = new Date();
                await addDoc(collection(db, "products"), productData);
                Swal.fire({
                    title: 'Producto Añadido',
                    icon: 'success',
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#111',
                    color: '#fff',
                    iconColor: '#99ff00'
                });
            }

            toggleModal(false);
            form.reset();
        } catch (error) {
            console.error("Error saving document: ", error);
            Swal.fire('Error', 'Hubo un error guardando el producto.', 'error');
        }
    });
}

// Global UI functions
window.toggleModal = function (show) {
    const modal = document.getElementById('product-modal');
    if (show) {
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
        document.getElementById('add-product-form').reset();
        document.getElementById('sizes-container').innerHTML = '';
    }
};

window.openAddModal = function () {
    document.getElementById('add-product-form').reset();
    document.getElementById('p-id').value = "";
    document.getElementById('modal-form-title').innerHTML = `Añadir <span class="green">Nuevo Producto</span>`;
    toggleModal(true);
};

window.openEditModal = async function (id) {
    try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
            const p = docSnap.data();
            document.getElementById('p-id').value = id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-category').value = p.category;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-stock').value = p.stock;
            document.getElementById('p-flavors').value = p.flavors ? p.flavors.join(', ') : '';

            // Cargar tamaños en filas
            const container = document.getElementById('sizes-container');
            container.innerHTML = '';
            if (p.sizes && p.sizes.length > 0) {
                p.sizes.forEach(s => addSizeRow(s.label, s.price));
            }

            document.getElementById('p-description').value = p.description || '';
            document.getElementById('p-images').value = p.images ? p.images.join('\n') : (p.img || '');

            document.getElementById('modal-form-title').innerHTML = `Editar <span class="green">Producto</span>`;
            toggleModal(true);
        }
    } catch (error) {
        console.error("Error fetching product details:", error);
    }
};

window.changeStock = async function (id, currentStock, change) {
    const newStock = parseInt(currentStock) + parseInt(change);
    if (newStock >= 0) {
        try {
            await updateDoc(doc(db, "products", id), { stock: newStock });
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    }
};
