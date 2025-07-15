// ✅ Get selected size
function getSelectedSize(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  const selectedSize = card.querySelector('.size-option.selected');
  return selectedSize ? selectedSize.textContent.trim() : null;
}

// ✅ Add to Cart
function addToCart(productId) {
  const size = getSelectedSize(productId);
  if (!size) return alert("Please select a size before adding to cart.");

  const card = document.querySelector(`.product-card[data-id="${productId}"]`);

  const product = {
    id: productId,
    name: card.querySelector('.product-title').textContent,
    price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, "")),
    size: size,
    image: card.querySelector('img').src,
    quantity: 1
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(p => p.id === productId && p.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("🛒 Added to cart!");
  updateCartCount();
}

// ✅ Add to Wishlist
function addToWishlist(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  const wishlistIcon = card.querySelector('.wishlist-icon i');
  
  // Toggle visual state
  wishlistIcon.classList.toggle('far');
  wishlistIcon.classList.toggle('fas');
  wishlistIcon.classList.toggle('text-red-500');

  const product = {
    id: productId,
    name: card.querySelector('.product-title').textContent,
    price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, "")),
    image: card.querySelector('img').src
  };

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const exists = wishlist.some(item => item.id === productId);

  if (exists) {
    wishlist = wishlist.filter(item => item.id !== productId);
    alert("❤️ Removed from wishlist!");
  } else {
    wishlist.push(product);
    alert("❤️ Added to wishlist!");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// ✅ Initialize all functionality
function initProductFunctionality() {
  // Size selection
  document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', function() {
      const siblings = Array.from(this.parentNode.children);
      siblings.forEach(sib => sib.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // Wishlist toggle
  document.querySelectorAll('.wishlist-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      addToWishlist(productId);
    });
  });

  // Add to Cart buttons
  document.querySelectorAll('.add-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.closest('.product-card').dataset.id;
      addToCart(productId);
    });
  });

  // Buy Now buttons
  document.querySelectorAll('.buy-now-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.closest('.product-card').dataset.id;
      const size = getSelectedSize(productId);
      
      if (!size) return alert("Please select a size before buying!");

      const card = document.querySelector(`.product-card[data-id="${productId}"]`);
      const product = {
        id: productId,
        name: card.querySelector('.product-title').textContent,
        price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, "")),
        size: size,
        image: card.querySelector('img').src,
        quantity: 1
      };

      localStorage.setItem('buyNowProduct', JSON.stringify(product));
      window.location.href = 'checkout.html';
    });
  });
}

// ✅ Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  cartCountElements.forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

// ✅ DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initProductFunctionality();
  updateCartCount();
  
  // Load wishlist state
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.querySelectorAll('.wishlist-icon').forEach(icon => {
    const productId = icon.dataset.productId;
    if (wishlist.some(item => item.id === productId)) {
      icon.querySelector('i').classList.replace('far', 'fas');
      icon.querySelector('i').classList.add('text-red-500');
    }
  });
});