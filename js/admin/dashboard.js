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
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Check Auth Status
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        initDashboard();
    }
});

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    });
}

function initDashboard() {
    loadInventory();
    setupAddForm();
    setupSizeRowLogic();
}

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
        let products = [];
        let totalVal = 0;
        let lowStock = 0;

        inventoryBody.innerHTML = '';

        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            products.push(p);

            // Stats
            totalVal += (p.price * p.stock);
            if (p.stock < 5) lowStock++;

            const statusClass = p.stock < 5 ? 'stock-low' : 'stock-ok';
            const statusText = p.stock < 5 ? 'Stock Bajo' : 'Disponible';

            inventoryBody.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td class="green">$${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                        <div class="stock-control">
                            <button onclick="changeStock('${id}', ${p.stock}, -1)"><i class="fas fa-minus"></i></button>
                            <span>${p.stock}</span>
                            <button onclick="changeStock('${id}', ${p.stock}, 1)"><i class="fas fa-plus"></i></button>
                        </div>
                    </td>
                    <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                    <td class="action-btns">
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

function updateStats(count, val, low) {
    document.getElementById('total-products').innerText = count;
    document.getElementById('total-sales').innerText = `$${val.toLocaleString()}`;
    document.getElementById('low-stock-count').innerText = low;
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
