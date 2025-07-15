// Load wishlist from localStorage
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Update wishlist in localStorage
function updateWishlistStorage() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Display wishlist items with enhanced UI
function displayWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items');
    const emptyWishlistElement = document.getElementById('empty-wishlist');

    if (!wishlist || wishlist.length === 0) {
        wishlistContainer.innerHTML = '';
        emptyWishlistElement.classList.remove('hidden');
        return;
    }

    emptyWishlistElement.classList.add('hidden');
    wishlistContainer.innerHTML = wishlist.map((item, index) => `
        <div class="wishlist-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300" data-id="${item.id}" data-size="${item.size}">
            <div class="relative">
                <img src="${item.image || 'https://via.placeholder.com/300'}" alt="${item.name}" 
                     class="w-full h-48 object-cover">
                <button onclick="handleRemoveFromWishlist(event, ${index})" 
                        class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition">
                    <i class="fas fa-times text-red-500"></i>
                </button>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1">${item.name}</h3>
                <p class="text-gray-600 mb-2">Size: ${item.size}</p>
                <div class="flex justify-between items-center mt-4">
                    <span class="font-bold text-lg">${item.price}</span>
                    <button onclick="handleAddToCartFromWishlist(event, ${index})"
                            class="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-md">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle remove from wishlist
function handleRemoveFromWishlist(event, index) {
    event.stopPropagation();
    if (!confirm("Remove this item from your wishlist?")) return;
    
    if (index >= 0 && index < wishlist.length) {
        wishlist.splice(index, 1);
        updateWishlistStorage();
        displayWishlistItems();
    }
}

// Handle add to cart from wishlist
function handleAddToCartFromWishlist(event, index) {
    event.stopPropagation();
    
    if (index >= 0 && index < wishlist.length) {
        const item = wishlist[index];
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Check if item already exists in cart
        const existingItem = cart.find(p => p.id === item.id && p.size === item.size);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ 
                ...item, 
                quantity: 1 
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Show confirmation message
        showToast("Added to cart!");
        
        // Remove from wishlist
        wishlist.splice(index, 1);
        updateWishlistStorage();
        displayWishlistItems();
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
});

// Make functions available globally
window.handleRemoveFromWishlist = handleRemoveFromWishlist;
window.handleAddToCartFromWishlist = handleAddToCartFromWishlist;