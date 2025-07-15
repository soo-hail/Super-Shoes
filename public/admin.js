document.addEventListener("DOMContentLoaded", async () => {
  loadDashboardSummary();
  loadOrders();
  loadReturnRequests();
  loadProducts();
});

// 🚀 Dashboard Summary
async function loadDashboardSummary() {
  try {
    const ordersRes = await fetch("http://localhost:5000/get-all-orders");
    const orders = await ordersRes.json();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.price * o.quantity), 0);

    const returnsRes = await fetch("http://localhost:5000/get-all-returns");
    const returns = await returnsRes.json();
    const pendingReturns = returns.filter(r => r.status === "Pending").length;

    document.getElementById("total-orders").textContent = totalOrders;
    document.getElementById("total-revenue").textContent = `₹${totalRevenue}`;
    document.getElementById("total-returns").textContent = pendingReturns;
  } catch (err) {
    console.error("Failed to load dashboard summary:", err);
  }
}

// Function to load all orders
async function loadOrders() {
  const ordersSection = document.getElementById("orders-section");
  const paginationSection = document.getElementById("pagination-section");
  
  try {
    // Show loading state
    ordersSection.innerHTML = `<div class="flex justify-center items-center p-8">
      <svg class="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>`;

    const res = await fetch("http://localhost:5000/get-all-orders");
    const orders = await res.json();
    
    if (orders.length === 0) {
      ordersSection.innerHTML = `
        <div class="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="mt-2 text-gray-600">No orders found.</p>
        </div>`;
      paginationSection.style.display = 'none';
      return;
    }

    let html = `
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Info</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">`;
    
    orders.forEach(order => {
      // Generate unique order ID from database ID
      const orderId = `#ORD-${new Date(order.created_at).getFullYear()}-${order.id.toString().padStart(3, '0')}`;
      
      // Get status color class
      let statusColorClass = "";
      let statusDotClass = "";
      
      switch(order.status) {
        case "Placed":
          statusColorClass = "bg-yellow-100";
          statusDotClass = "bg-yellow-400";
          break;
        case "Shipped":
          statusColorClass = "bg-blue-100";
          statusDotClass = "bg-blue-400";
          break;
        case "Out for Delivery":
          statusColorClass = "bg-purple-100";
          statusDotClass = "bg-purple-400";
          break;
        case "Delivered":
          statusColorClass = "bg-green-100";
          statusDotClass = "bg-green-400";
          break;
        default:
          statusColorClass = "bg-gray-100";
          statusDotClass = "bg-gray-400";
      }
      
      // Get payment status
      const isPaid = order.payment_method !== "COD" || order.status === "Delivered";
      const paymentStatusClass = isPaid ? "bg-green-100" : "bg-yellow-100";
      const paymentStatusIcon = isPaid ? 
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>` : 
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      
      // Generate customer initials
      const emailParts = order.user_email.split('@');
      const name = emailParts[0].split('.');
      let initials = name[0][0].toUpperCase();
      if (name.length > 1) {
        initials += name[1][0].toUpperCase();
      } else if (name[0].length > 1) {
        initials += name[0][1].toUpperCase();
      }
      
      html += `
        <tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${orderId}</div>
                <div class="text-sm text-gray-500">${new Date(order.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-blue-600 font-medium">${initials}</span>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${order.user_email}</div>
                <div class="text-sm text-gray-500">Customer #${order.id}</div>
              </div>
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">Product ID: ${order.product_id}</div>
            <div class="text-sm text-gray-500">Size: ${order.size} | Quantity: ${order.quantity}</div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="h-2.5 w-2.5 rounded-full ${statusDotClass} mr-2"></div>
              <select 
                class="text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
                onchange="updateOrderStatus('${order.id}', this.value)">
                <option value="Placed" ${order.status === "Placed" ? "selected" : ""}>Placed</option>
                <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                <option value="Out for Delivery" ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
                <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
              </select>
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end">
              <div class="flex-shrink-0 h-6 w-6 rounded-full ${paymentStatusClass} flex items-center justify-center">
                ${paymentStatusIcon}
              </div>
              <div class="ml-2 text-sm text-gray-900">₹${order.price} (${order.payment_method})</div>
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex justify-end gap-2">
              <button class="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="View Details" onclick="viewOrderDetails('${order.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Track Order" onclick="trackOrder('${order.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Cancel Order" onclick="confirmCancelOrder('${order.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
    
    html += `
        </tbody>
      </table>`;
    
    ordersSection.innerHTML = html;
    
    // Update pagination
    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / 10);
    updatePagination(totalOrders, 10, 1, totalPages);
    
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersSection.innerHTML = `
      <div class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-2 text-gray-600">Error loading orders. Please try again later.</p>
      </div>`;
    paginationSection.style.display = 'none';
  }
}

// Function to update pagination display
function updatePagination(totalItems, perPage, currentPage, totalPages) {
  const paginationSection = document.getElementById("pagination-section");
  
  // Calculate displayed item range
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);
  
  const html = `
    <div class="flex-1 flex justify-between items-center sm:hidden">
      <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" 
        ${currentPage === 1 ? 'disabled' : ''}
        onclick="changePage(${currentPage - 1})">
        Previous
      </button>
      <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        ${currentPage === totalPages ? 'disabled' : ''}
        onclick="changePage(${currentPage + 1})">
        Next
      </button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${totalItems}</span> results
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          ${generatePaginationNumbers(currentPage, totalPages)}
          <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  `;
  
  paginationSection.innerHTML = html;
}

// Function to generate pagination numbers
function generatePaginationNumbers(currentPage, totalPages) {
  let html = '';
  
  // Logic to determine which page numbers to show
  let pagesToShow = [];
  
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pagesToShow.push(i);
    }
  } else {
    // Always show first page
    pagesToShow.push(1);
    
    if (currentPage <= 3) {
      // If current page is near the start
      pagesToShow.push(2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // If current page is near the end
      pagesToShow.push('...', totalPages-3, totalPages-2, totalPages-1, totalPages);
    } else {
      // Current page is in the middle
      pagesToShow.push('...', currentPage-1, currentPage, currentPage+1, '...', totalPages);
    }
  }
  
  // Generate HTML
  pagesToShow.forEach(page => {
    if (page === '...') {
      html += `
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          ...
        </span>`;
    } else {
      const isCurrentPage = page === currentPage;
      html += `
        <button onclick="changePage(${page})" 
          class="${isCurrentPage 
            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' 
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} 
            relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          ${page}
        </button>`;
    }
  });
  
  return html;
}

// Function to change page
function changePage(page) {
  // In a real implementation, this would fetch the specific page of data
  console.log(`Change to page ${page}`);
  // For now, we'll just update the pagination UI
  const totalItems = 47; // This would come from your API
  const perPage = 10;
  const totalPages = Math.ceil(totalItems / perPage);
  
  updatePagination(totalItems, perPage, page, totalPages);
}

// Function to update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch("http://localhost:5000/update-order-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId,
        status: newStatus
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Show success toast notification
      showToast(`Order #${orderId} status updated to ${newStatus}`, "success");
    } else {
      // Show error toast notification
      showToast("Error updating order status", "error");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showToast("Error updating order status", "error");
  }
}

// Function to view order details
function viewOrderDetails(orderId) {
  // Redirect to order details page or show modal
  console.log(`View details for order ${orderId}`);
}

// Function to track order
function trackOrder(orderId) {
  // Redirect to tracking page or show tracking modal
  console.log(`Track order ${orderId}`);
}

// Function to confirm cancel order
function confirmCancelOrder(orderId) {
  if (confirm(`Are you sure you want to cancel order #${orderId}?`)) {
    cancelOrder(orderId);
  }
}

// Function to cancel order
async function cancelOrder(orderId) {
  try {
    const res = await fetch("http://localhost:5000/cancel-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Show success toast notification
      showToast(`Order #${orderId} has been cancelled`, "success");
      // Reload orders
      loadOrders();
    } else {
      // Show error toast notification
      showToast("Error cancelling order", "error");
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    showToast("Error cancelling order", "error");
  }
}

// Function to show toast notification
function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 py-2 px-4 rounded-lg text-white flex items-center shadow-lg ${
    type === "success" ? "bg-green-500" : 
    type === "error" ? "bg-red-500" : 
    type === "warning" ? "bg-yellow-500" : 
    "bg-blue-500"
  }`;
  
  // Add icon based on type
  let icon = "";
  switch (type) {
    case "success":
      icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>`;
      break;
    case "error":
      icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>`;
      break;
    default:
      icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>`;
  }
  
  // Add content
  toast.innerHTML = `${icon}<span>${message}</span>`;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
}

// Load orders on page load
document.addEventListener("DOMContentLoaded", loadOrders);

// Search functionality

// 🔁 Update Order Status

function updateOrderStatus(orderId, status) {
  fetch("http://localhost:5000/update-order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: orderId, status })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadOrders(); // Refresh list
    })
    .catch(err => {
      alert("Error updating order status.");
      console.error(err);
    });
}

// 🔁 Load and Manage Returns / Exchanges
async function loadReturnRequests() {
  const returnsSection = document.getElementById("returns-section");

  try {
    const res = await fetch("http://localhost:5000/get-all-returns");
    const data = await res.json();

    if (data.length === 0) {
      returnsSection.innerHTML = "<p>No return/exchange requests found.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Product ID</th>
            <th>Size</th>
            <th>New Size</th>
            <th>Type</th>
            <th>Status</th>
            <th>Requested At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
      html += `
        <tr>
          <td>${item.user_email}</td>
          <td>${item.product_id}</td>
          <td>${item.size}</td>
          <td>${item.new_size || "-"}</td>
          <td>${item.request_type}</td>
          <td>${item.status}</td>
          <td>${new Date(item.requested_at).toLocaleString()}</td>
          <td>
            ${item.status === "Pending" ? `
              <button class="approve" onclick="updateRequest(${item.id}, 'Approved')">Approve</button>
              <button class="reject" onclick="updateRequest(${item.id}, 'Rejected')">Reject</button>
            ` : item.status}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    returnsSection.innerHTML = html;

  } catch (err) {
    console.error("Error loading return requests:", err);
    returnsSection.innerHTML = "<p>Error loading return/exchange requests.</p>";
  }
}

// ✅ Update Return/Exchange Status
function updateRequest(id, status) {
  fetch("http://localhost:5000/update-return-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadReturnRequests(); // Refresh
    })
    .catch(err => {
      alert("Error updating status.");
      console.error(err);
    });
}

// ✅ Load All Products
async function loadProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  try {
    const res = await fetch("http://localhost:5000/get-products");
    const products = await res.json();

    if (products.length === 0) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price (₹)</th>
            <th>Type</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;

    products.forEach(p => {
      html += `
        <tr>
          <td>${p.product_id}</td>
          <td>${p.name}</td>
          <td>₹${p.price}</td>
          <td>${p.type}</td>
          <td><img src="${p.image_url}" width="50"/></td>
          <td>
            <button onclick="deleteProduct('${p.product_id}')">🗑️ Delete</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

  } catch (err) {
    console.error("Error loading products:", err);
    container.innerHTML = "<p>Error loading products.</p>";
  }
}

// 🗑️ Delete Product
function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  fetch("http://localhost:5000/delete-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadProducts();
    })
    .catch(err => {
      alert("Error deleting product.");
      console.error(err);
    });
}

// 🛒 Add New Product
document.getElementById("add-product-form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const newProduct = {
    product_id: document.getElementById("product-id").value,
    name: document.getElementById("product-name").value,
    price: parseInt(document.getElementById("product-price").value),
    type: document.getElementById("product-type").value,
    image_url: document.getElementById("product-image").value
  };

  fetch("http://localhost:5000/add-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      this.reset();
      loadProducts();
    })
    .catch(err => {
      alert("Error adding product.");
      console.error(err);
    });
});

// 🔒 Admin Logout
function adminLogout() {
  sessionStorage.removeItem("isAdmin");
  window.location.href = "admin-login.html";
}