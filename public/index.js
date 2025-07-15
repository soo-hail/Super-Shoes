// Enhanced Product Data with Ratings
const featuredProducts = [
  {
    id: 1,
    name: "Urban Street Sneakers",
    price: 2999,
    image: "img/prod1.PNG",
    description: "Perfect for city adventurers",
    color: "purple",
    rating: 4.5,
    tags: ["New", "Bestseller"]
  },
  {
    id: 2,
    name: "Classic Leather Shoes",
    price: 3499,
    image: "img/prod5.png",
    description: "Timeless style and elegance",
    color: "blue",
    rating: 4.8,
    tags: ["Premium"]
  },
  {
    id: 3,
    name: "Running Shoes Pro",
    price: 2599,
    image: "img/prod12.png",
    description: "Maximum performance",
    color: "red",
    rating: 4.3,
    tags: ["Sale", "-20%"]
  },
  {
    id: 4,
    name: "High-top Trainers",
    price: 3199,
    image: "img/nike3.png",
    description: "Urban street style",
    color: "pink",
    rating: 4.7,
    tags: ["Limited"]
  }
];

function addToCart(productId, sizeName) {
  // Get selected size
  const sizeSelect = document.querySelector(`select[name="${sizeName}"]`);
  const size = sizeSelect ? sizeSelect.value : null;
  
  if (!size) {
    alert("Please select a size before adding to cart.");
    return;
  }

  // Get product info (simplified version)
  const card = document.querySelector(`button[onclick*="${productId}"]`).closest('.product-card');
  const product = {
    id: productId,
    name: card.querySelector('h3').textContent,
    price: card.querySelector('p').textContent,
    size: size,
    image: card.querySelector('img').src,
    quantity: 1
  };

  // Update cart in localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(item => item.id === productId && item.size === size);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(product);
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Item added to cart!");
}

function displayFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  
  featuredProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add(
      "group", "bg-white", "rounded-2xl", "shadow-md", 
      "overflow-hidden", "transition-all", "duration-300", 
      "hover:shadow-xl", "hover:-translate-y-2", "relative"
    );
    
    // Color mappings (only using for text and buttons now)
    const colorMap = {
      purple: { bg: "bg-orange-600", text: "text-orange-600" }, 
      blue: { bg: "bg-orange-600", text: "text-orange-600" },   
      red: { bg: "bg-orange-600", text: "text-orange-600" },   
      pink: { bg: "bg-orange-600", text: "text-orange-600" }  
    }
    
    const colors = colorMap[product.color];
    
    // Tags badge
    const tagsHtml = product.tags.map(tag => 
      `<span class="inline-block px-2 py-1 text-xs font-semibold rounded-full mr-1 mb-1 ${tag === 'Sale' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
        ${tag}
      </span>`
    ).join('');
    
    // Rating stars
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const starsHtml = `
      <div class="flex items-center mt-1">
        ${Array(fullStars).fill('<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>').join('')}
        ${hasHalfStar ? '<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>' : ''}
        ${Array(emptyStars).fill('<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>').join('')}
        <span class="text-xs text-gray-500 ml-1">(${product.rating})</span>
      </div>
    `;
    
    card.innerHTML = `    
      <!-- Product Tags -->
      <div class="absolute top-3 left-3 z-10">${tagsHtml}</div>

      <!-- Image (without gradient overlay) -->
      <div class="relative h-60 overflow-hidden bg-gray-50">
        <img src="${product.image}" alt="${product.name}" 
            class="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105" />
      </div>

      <!-- Product Info -->
      <div class="p-5">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900">${product.name}</h3>
            <p class="text-sm text-gray-500 mt-1">${product.description}</p>
            ${starsHtml}
          </div>
          <span class="text-lg font-bold ${colors.text}">₹${(product.price)}</span>
        </div>
        
        <!-- Size Selector -->
        <select name="size-${product.id}" class="mt-3 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select Size</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
        
        <!-- Add to Cart Button -->
        <button 
          onclick="addToCart('${product.id}', 'size-${product.id}')"
          class="mt-3 w-full ${colors.bg} text-white py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", displayFeaturedProducts);