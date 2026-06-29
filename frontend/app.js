// 1. Static Product Catalog Data (No Backend Needed)
const products = [
    { id: 1, name: "AeroTech Pro Mechanical Keyboard", description: "RGB Backlit, Linear Red Switches, Ergonomic Design.", price: 4500.00, image_url: "https://unsplash.com" },
    { id: 2, name: "AeroTech Apex Wireless Mouse", description: "26K DPI Optical Sensor, Ultra-lightweight 54g.", price: 2990.00, image_url: "https://unsplash.com" },
    { id: 3, name: "AeroTech SoundPulse Headset", description: "7.1 Spatial Surround Sound, Noise Cancelling Mic.", price: 3500.00, image_url: "https://unsplash.com" },
    { id: 4, name: "AeroTech UltraWide 34\" Monitor", description: "144Hz Refresh Rate, 1ms Response Time, Curved Display.", price: 24999.00, image_url: "https://unsplash.com" },
    { id: 5, name: "AeroTech Streamer Premium Mic", description: "Studio-quality USB Condenser Microphone for Streaming.", price: 5400.00, image_url: "https://unsplash.com" },
    { id: 6, name: "AeroTech RGB Gaming Mouse Pad", description: "XL Extended Size with 14 Chroma Light Modes.", price: 1200.00, image_url: "https://unsplash.com" },
    { id: 7, name: "AeroTech Ergonomic Gaming Chair", description: "High-Density Foam, 4D Armrests, Lumbar Support.", price: 14500.00, image_url: "https://unsplash.com" },
    { id: 8, name: "AeroTech 4K Ultra Webcam", description: "60FPS Streaming Camera with Autofocus and Privacy Cover.", price: 4200.00, image_url: "https://unsplash.com" }
];

// 2. Cart State Configuration
let cart = JSON.parse(localStorage.getItem('aerotech_cart')) || [];

// 3. Initialize & Load Application Features
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    
    // Check if on Checkout/Cart Page to render items
    if (document.getElementById('cart-items-container')) {
        renderCartPage();
    }
});

// 4. Render 8 Dynamic Products in UI
function loadProducts() {
    const catalogContainer = document.querySelector('[id*="catalog"]') || document.querySelector('[class*="catalog"]') || document.querySelector('[id*="product"]') || document.querySelector('.products-grid') || document.getElementById('products-container');
    
    if (catalogContainer) {
        catalogContainer.innerHTML = ''; // Loading టెక్స్ట్‌ని క్లియర్ చేస్తుంది
        
        products.forEach(product => {
            catalogContainer.innerHTML += `
                <div class="product-card" style="border: 1px solid #2d2d2d; border-radius: 12px; padding: 16px; background: #16161a; margin: 10px;">
                    <img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                    <h3 style="margin-top: 12px; color: #fff; font-size: 1.2rem;">${product.name}</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin: 8px 0; min-height: 40px;">${product.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                        <span style="color: #3b82f6; font-weight: bold; font-size: 1.2rem;">₹${product.price.toLocaleString('en-IN')}</span>
                        <button onclick="addToCart(${product.id})" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">Add to Cart</button>
                    </div>
                </div>
            `;
        });
    }
}

// 5. Add Items to Shopping Cart Logic
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    alert(`${product.name} added to cart!`);
    
    if (document.getElementById('cart-items-container')) {
        renderCartPage();
    }
};

// 6. Global UI Cart Counters & Icon Sync
function updateCartUI() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-badge, .badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// 7. Render Complete Cart/Checkout Page Items List
function renderCartPage() {
    const cartContainer = document.getElementById('cart-items-container');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: #94a3b8;">Your cart is currently empty.</div>`;
        updateSummary(0);
        return;
    }
    
    cartContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartContainer.innerHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #2d2d2d;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${item.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
                    <div>
                        <h4 style="color: #fff; margin: 0;">${item.name}</h4>
                        <span style="color: #3b82f6;">₹${item.price.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)" style="width: 50px; background: #222; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 4px; text-align: center;">
                    <span style="color: #fff; font-weight: bold; min-width: 80px; text-align: right;">₹${itemTotal.toLocaleString('en-IN')}</span>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; cursor: pointer;">❌</button>
                </div>
            </div>
        `;
    });
    
    updateSummary(subtotal);
}

// 8. Update Quantity Event Handler
window.updateQuantity = function(productId, newQty) {
    const qty = parseInt(newQty);
    if (qty <= 0 || isNaN(qty)) return;
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = qty;
        saveCart();
        updateCartUI();
        renderCartPage();
    }
};

// 9. Remove Item from Shopping Cart
window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderCartPage();
};

// 10. Compute Calculations & Checkout Pricing Summaries
function updateSummary(subtotal) {
    const subtotalEl = document.getElementById('checkout-subtotal') || document.querySelector('.subtotal-value') || document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('checkout-grand-total') || document.querySelector('.total-value') || document.getElementById('grand-total');
    const checkoutBtn = document.getElementById('proceed-checkout') || document.querySelector('.checkout-btn') || document.getElementById('checkout-button');
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    
    if (checkoutBtn) {
        checkoutBtn.onclick = function() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Order placed successfully! Thank you for shopping with AeroTech Store.');
            cart = [];
            saveCart();
            updateCartUI();
            if (document.getElementById('cart-items-container')) {
                renderCartPage();
            }
        };
    }
}

// 12. LocalStorage Persistence Wrapper
function saveCart() {
    localStorage.setItem('aerotech_cart', JSON.stringify(cart));
}