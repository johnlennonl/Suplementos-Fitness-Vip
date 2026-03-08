/**
 * Admin Logic
 * Suplementos Fitness VIP
 */

document.addEventListener('DOMContentLoaded', () => {
    renderInventory();

    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addProduct();
        });
    }
});

function getInventory() {
    return JSON.parse(localStorage.getItem('inventory')) || [];
}

function saveInventory(inventory) {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
}

function renderInventory() {
    const inventory = getInventory();
    const tableBody = document.getElementById('inventory-body');

    if (!tableBody) return;

    tableBody.innerHTML = inventory.map(product => `
        <tr>
            <td><strong>${product.name}</strong></td>
            <td><span class="category-tag">${product.category}</span></td>
            <td class="green">$${product.price.toFixed(2)}</td>
            <td>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Global scope for onclick
window.deleteProduct = function (id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        let inventory = getInventory();
        inventory = inventory.filter(p => p.id !== id);
        saveInventory(inventory);
    }
};

function addProduct() {
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value;

    const inventory = getInventory();

    const newProduct = {
        id: Date.now(), // Unique ID
        name,
        price,
        category,
        img: 'img/p-default.jpg' // Placeholder
    };

    inventory.push(newProduct);
    saveInventory(inventory);

    // Reset Form
    document.getElementById('add-product-form').reset();
    alert('Producto añadido con éxito.');
}
