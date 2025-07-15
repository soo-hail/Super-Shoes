document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCartElement = document.getElementById("empty-cart");
  const cartSummaryElement = document.getElementById("cart-summary");
  const subtotalElement = document.getElementById("subtotal");
  const shippingElement = document.getElementById("shipping");
  const taxElement = document.getElementById("tax");
  const cartTotalElement = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCart() {
    cartItemsContainer.innerHTML = "";
  
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      emptyCartElement.classList.remove("hidden");
      cartSummaryElement.classList.add("hidden");
      cartItemsContainer.innerHTML = "<p class='p-6 text-center text-gray-500'>Your cart is empty</p>";
      return;
    }
  
    emptyCartElement.classList.add("hidden");
    cartSummaryElement.classList.remove("hidden");
  
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;
  
    // Update summary
    subtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
    shippingElement.textContent = shipping === 0 ? "Free" : `₹${shipping}`;
    taxElement.textContent = `₹${tax.toLocaleString()}`;
    cartTotalElement.textContent = `₹${total.toLocaleString()}`;
  
    // Render each cart item
    cart.forEach((item, index) => {
      const itemElement = document.createElement("div");
      itemElement.className = "p-4 md:p-6 border-b border-gray-200";
      itemElement.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          <img src="${item.image || 'https://via.placeholder.com/150'}" 
               alt="${item.name}" 
               class="w-24 h-24 object-cover rounded-lg">
          
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-lg text-gray-800">${item.name}</h3>
            ${item.size ? `<p class="text-gray-600 text-sm">Size: ${item.size}</p>` : ''}
            <p class="font-bold text-gray-800 mt-1">₹${item.price.toLocaleString()}</p>
          </div>
          
          <div class="flex flex-col gap-3 items-end">
            <div class="flex items-center border border-gray-200 rounded">
              <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      onclick="decrementItem(${index})">
                <i class="fas fa-minus text-xs"></i>
              </button>
              <input type="number" 
                     min="1" 
                     value="${item.quantity}" 
                     class="w-12 h-8 text-center border-x border-gray-200"
                     onchange="updateQuantity(${index}, this.value)">
              <button class="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      onclick="incrementItem(${index})">
                <i class="fas fa-plus text-xs"></i>
              </button>
            </div>
            
            <p class="font-bold">₹${(item.price * item.quantity).toLocaleString()}</p>
            
            <button class="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    onclick="removeItem(${index})">
              <i class="fas fa-trash-alt"></i>
              Remove
            </button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  // Quantity update functions
  window.updateQuantity = (index, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;
    
    cart[index].quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  window.incrementItem = (index) => {
    cart[index].quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  window.decrementItem = (index) => {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  };

  // Remove item function
  window.removeItem = (index) => {
    if (confirm("Are you sure you want to remove this item from your cart?")) {
      const itemElement = cartItemsContainer.children[index];
      itemElement.classList.remove("cart-item-enter");
      itemElement.classList.add("cart-item-exit-active");
      
      setTimeout(() => {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      }, 300);
    }
  };

  // Checkout function
  window.goToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before checkout.");
      return;
    }
    window.location.href = "checkout.html";
  };

  // Initial render
  renderCart();
});