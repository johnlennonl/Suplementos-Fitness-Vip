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
    doc,
    query,
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
}

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
                    <td class="green">$${p.price.toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                    <td class="action-btns">
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

        // Procesar sabores como array
        const flavorsRaw = document.getElementById('p-flavors').value;
        const flavors = flavorsRaw ? flavorsRaw.split(',').map(f => f.trim()).filter(f => f !== "") : [];

        // Procesar imágenes como array (una por línea)
        const imagesRaw = document.getElementById('p-images').value;
        const images = imagesRaw.split('\n').map(i => i.trim()).filter(i => i !== "");

        const newProduct = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            flavors: flavors,
            description: document.getElementById('p-description').value,
            images: images,
            img: images[0] || "", // Imagen principal para la web actual
            createdAt: new Date()
        };

        try {
            await addDoc(collection(db, "products"), newProduct);
            toggleModal(false);
            form.reset();
            Swal.fire({
                title: 'Producto Añadido',
                icon: 'success',
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#111',
                color: '#fff',
                iconColor: '#99ff00'
            });
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    });
}

// Global UI functions
window.toggleModal = function (show) {
    const modal = document.getElementById('product-modal');
    modal.style.display = show ? 'block' : 'none';
};
