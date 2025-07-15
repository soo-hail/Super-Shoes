// Global variables
let currentUser = null;
let allOrders = [];
let allReturns = [];
let allWishlistItems = [];

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize UI
    setupTabNavigation();
    
    // Get logged-in user
    currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    // Check login status
    if (!currentUser || !currentUser.email) {
        showLoginAlert();
        return;
    }
    
    // Update user info in header
    updateUserProfile();
    
    // Load data based on active tab
    const activeTab = document.querySelector('.nav-tab.active').id;
    loadTabContent(activeTab);
});

// Show login required alert
function showLoginAlert() {
    Swal.fire({
        icon: 'error',
        title: 'Login Required',
        text: 'Please login to view your profile',
        confirmButtonText: 'OK'
    }).then(() => {
        window.location.href = "login.html";
    });
}

// Setup tab navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show active tab content
            const tabId = tab.id.replace('Tab', 'Content');
            document.getElementById(tabId).classList.remove('hidden');
            
            // Load content for the tab if not already loaded
            loadTabContent(tab.id);
        });
    });
}

// Load content for active tab
function loadTabContent(tabId) {
    switch(tabId) {
        case 'ordersTab':
            loadOrders();
            break;
        case 'wishlistTab':
            loadWishlist();
            break;
        case 'returnsTab':
            loadReturns();
            break;
        case 'settingsTab':
            // Settings tab is already populated in HTML
            break;
    }
}

// Update user profile in header
function updateUserProfile() {
    if (!currentUser) return;
    
    const name = currentUser.name || 'User';
    const email = currentUser.email || '';
    
    // Set user initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    // Set user name and email
    document.getElementById('userName').textContent = name;
    document.getElementById('userEmail').textContent = email;
}

// Load orders
async function loadOrders() {
    const container = document.getElementById('order-history');
    showLoadingSkeleton(container, 'orders');
    
    try {
        // In a real app, you would fetch from your API:
        // const response = await fetch(`/api/orders?userId=${currentUser.id}`);
        // allOrders = await response.json();
        
        // Mock data for demonstration
        allOrders = getMockOrders();
        
        if (allOrders.length === 0) {
            showEmptyState(container, {
                icon: 'box-open',
                title: 'No orders yet',
                message: 'You haven\'t placed any orders with us yet.',
                buttonText: 'Start Shopping',
                action: () => window.location.href = 'product.html'
            });
            return;
        }
        
        renderOrders(container);
    } catch (error) {
        showErrorState(container, {
            icon: 'exclamation-triangle',
            title: 'Error loading orders',
            message: 'We couldn\'t load your order history. Please try again later.',
            action: loadOrders
        });
        console.error("Order fetch error:", error);
    }
}

// Get mock orders (replace with real API call)
function getMockOrders() {
    return [
        {
            id: 'ORD-12345',
            product_name: 'Premium Running Shoes',
            image_url: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1065&q=80',
            size: 'US 10',
            quantity: 1,
            price: 12999,
            status: 'Delivered',
            tracking_id: 'TRK-789456',
            created_at: '2023-06-15T10:30:00Z',
            product_id: 'PROD-001'
        },
        {
            id: 'ORD-12346',
            product_name: 'Casual Sneakers',
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            size: 'US 9',
            quantity: 2,
            price: 4999,
            status: 'Shipped',
            tracking_id: 'TRK-789457',
            created_at: '2023-06-20T14:15:00Z',
            product_id: 'PROD-002'
        }
    ];
}

// Render orders
function renderOrders(container) {
    container.innerHTML = '';
    allOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card bg-white rounded-xl shadow-sm overflow-hidden mb-6';
        orderCard.innerHTML = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row">
                    <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        <img src="${order.image_url}" alt="${order.product_name}" class="w-24 h-24 object-cover rounded-lg">
                    </div>
                    <div class="flex-grow">
                        <div class="flex flex-col md:flex-row md:justify-between">
                            <div class="mb-4 md:mb-0">
                                <h3 class="text-lg font-medium text-gray-800">${order.product_name}</h3>
                                <p class="text-sm text-gray-500 mt-1">Order #${order.id} • ${new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-lg font-semibold text-gray-800">₹${order.price.toLocaleString()}</p>
                                <p class="text-sm text-gray-500">Qty: ${order.quantity}</p>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }">
                                        ${order.status}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Size: ${order.size}</p>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                ${renderOrderProgress(order.status)}
                            </div>
                        </div>
                        
                        <div class="mt-6 flex flex-wrap gap-3">
                            ${order.status === 'Pending' ? `
                                <button onclick="cancelOrder('${order.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                                    <i class="fas fa-times-circle mr-2"></i>Cancel Order
                                </button>
                            ` : ''}
                            
                            <button onclick="trackOrder('${order.tracking_id}')" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                                <i class="fas fa-truck mr-2"></i>Track Order
                            </button>
                            
                            <button onclick="downloadInvoice(${JSON.stringify(order).replace(/"/g, '&quot;')})" class="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                                <i class="fas fa-file-invoice mr-2"></i>Download Invoice
                            </button>
                            
                            ${order.status === 'Delivered' ? `
                                <button onclick="requestReturn('${order.id}', '${order.product_id}', '${order.size}')" class="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                                    <i class="fas fa-undo mr-2"></i>Request Return
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

// Render order progress
function renderOrderProgress(status) {
    const stages = [
        { id: 'placed', label: 'Order Placed' },
        { id: 'processed', label: 'Processed' },
        { id: 'shipped', label: 'Shipped' },
        { id: 'out-for-delivery', label: 'Out for Delivery' },
        { id: 'delivered', label: 'Delivered' }
    ];
    
    const statusIndex = {
        'Pending': 0,
        'Processing': 1,
        'Shipped': 2,
        'Out for Delivery': 3,
        'Delivered': 4
    };
    
    const currentIndex = statusIndex[status] || 0;
    
    return `
        <div class="flex items-center justify-between">
            ${stages.map((stage, index) => `
                <div class="flex flex-col items-center">
                    <div class="progress-step ${index <= currentIndex ? 'active' : ''}">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                            index <= currentIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                        }">
                            ${index < currentIndex ? '<i class="fas fa-check text-xs"></i>' : index + 1}
                        </div>
                    </div>
                    <span class="text-xs mt-2 text-center ${
                        index <= currentIndex ? 'text-orange-600 font-medium' : 'text-gray-500'
                    }">${stage.label}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Load wishlist
function loadWishlist() {
    const container = document.getElementById('wishlist-items');
    showLoadingSkeleton(container, 'wishlist');
    
    try {
        // In a real app, you might fetch from an API:
        // const response = await fetch(`/api/wishlist?userId=${currentUser.id}`);
        // allWishlistItems = await response.json();
        
        // For now, use localStorage
        allWishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        if (allWishlistItems.length === 0) {
            showEmptyState(container, {
                icon: 'heart',
                title: 'Your wishlist is empty',
                message: 'Save items you love to buy them later',
                buttonText: 'Browse Products',
                action: () => window.location.href = 'product.html'
            }, 'wishlist');
            return;
        }
        
        renderWishlist(container);
    } catch (error) {
        showErrorState(container, {
            icon: 'exclamation-triangle',
            title: 'Error loading wishlist',
            message: 'We couldn\'t load your wishlist items. Please try again later.',
            action: loadWishlist
        }, 'wishlist');
        console.error("Wishlist load error:", error);
    }
}

// Render wishlist
function renderWishlist(container) {
    container.innerHTML = '';
    allWishlistItems.forEach((item, index) => {
        const wishlistCard = document.createElement('div');
        wishlistCard.className = 'wishlist-card bg-white rounded-xl shadow-sm overflow-hidden';
        wishlistCard.innerHTML = `
            <div class="relative">
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
                <button onclick="removeFromWishlist(${index})" class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-medium text-gray-800 mb-1">${item.name}</h3>
                <p class="text-sm text-gray-500 mb-2">Size: ${item.size}</p>
                <p class="text-lg font-semibold text-gray-800 mb-4">₹${item.price.toLocaleString()}</p>
                <div class="flex space-x-2">
                    <button onclick="moveToCart(${index})" class="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                    <button class="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <i class="fas fa-ellipsis-h text-gray-500"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(wishlistCard);
    });
}

// Load returns
function loadReturns() {
    const container = document.getElementById('return-history');
    showLoadingSkeleton(container, 'returns');
    
    try {
        // In a real app, you would fetch from your API:
        // const response = await fetch(`/api/returns?userId=${currentUser.id}`);
        // allReturns = await response.json();
        
        // Mock data for demonstration
        allReturns = getMockReturns();
        
        if (allReturns.length === 0) {
            showEmptyState(container, {
                icon: 'exchange-alt',
                title: 'No returns or exchanges',
                message: 'You haven\'t requested any returns or exchanges yet.'
            });
            return;
        }
        
        renderReturns(container);
    } catch (error) {
        showErrorState(container, {
            icon: 'exclamation-triangle',
            title: 'Error loading returns',
            message: 'We couldn\'t load your return history. Please try again later.',
            action: loadReturns
        });
        console.error("Returns load error:", error);
    }
}

// Get mock returns (replace with real API call)
function getMockReturns() {
    return [
        {
            id: 'RET-78945',
            product_id: 'PROD-001',
            product_name: 'Premium Running Shoes',
            image_url: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1065&q=80',
            size: 'US 10',
            request_type: 'return',
            status: 'Processing',
            requested_at: '2023-06-18T09:15:00Z',
            reason: 'Wrong size'
        },
        {
            id: 'EXC-78946',
            product_id: 'PROD-002',
            product_name: 'Casual Sneakers',
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            size: 'US 9',
            new_size: 'US 10',
            request_type: 'exchange',
            status: 'Approved',
            requested_at: '2023-06-22T14:30:00Z',
            reason: 'Need different size'
        }
    ];
}

// Render returns
function renderReturns(container) {
    container.innerHTML = '';
    allReturns.forEach(item => {
        const returnCard = document.createElement('div');
        returnCard.className = 'return-card bg-white rounded-xl shadow-sm overflow-hidden mb-6';
        returnCard.innerHTML = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row">
                    <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        <img src="${item.image_url}" alt="${item.product_name}" class="w-24 h-24 object-cover rounded-lg">
                    </div>
                    <div class="flex-grow">
                        <div class="flex flex-col md:flex-row md:justify-between">
                            <div class="mb-4 md:mb-0">
                                <h3 class="text-lg font-medium text-gray-800">${item.product_name}</h3>
                                <p class="text-sm text-gray-500 mt-1">${item.request_type === 'return' ? 'Return' : 'Exchange'} #${item.id} • ${new Date(item.requested_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    item.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    ${item.status}
                                </span>
                            </div>
                        </div>
                        
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">Size: ${item.size}</p>
                                ${item.request_type === 'exchange' ? `
                                    <p class="text-sm text-gray-500">New Size: ${item.new_size}</p>
                                ` : ''}
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Reason: ${item.reason}</p>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex flex-wrap gap-3">
                            <button onclick="checkReturnStatus('${item.id}')" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                                <i class="fas fa-info-circle mr-2"></i>Check Status
                            </button>
                            
                            ${item.status === 'Processing' ? `
                                <button onclick="cancelReturnRequest('${item.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                                    <i class="fas fa-times-circle mr-2"></i>Cancel Request
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(returnCard);
    });
}

// Show loading skeleton
function showLoadingSkeleton(container, type) {
    if (type === 'orders') {
        container.innerHTML = `
            <div class="animate-pulse flex flex-col space-y-4">
                <div class="h-40 bg-gray-200 rounded-lg"></div>
                <div class="h-40 bg-gray-200 rounded-lg"></div>
            </div>
        `;
    } else if (type === 'wishlist') {
        container.innerHTML = `
            <div class="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="h-80 bg-gray-200 rounded-lg"></div>
                <div class="h-80 bg-gray-200 rounded-lg"></div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="animate-pulse h-40 bg-gray-200 rounded-lg"></div>
        `;
    }
}

// Show empty state
function showEmptyState(container, options, type = 'orders') {
    const emptyContainer = document.createElement('div');
    emptyContainer.className = `bg-white rounded-xl p-8 text-center ${type === 'wishlist' ? 'col-span-3' : ''}`;
    emptyContainer.innerHTML = `
        <i class="fas fa-${options.icon} text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700 mb-2">${options.title}</h3>
        <p class="text-gray-500 mb-4">${options.message}</p>
        ${options.buttonText ? `
            <button onclick="${options.action.toString().includes('()') ? options.action.toString().replace('function ', '').replace('()', '') : options.action}" 
                class="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                ${options.buttonText}
            </button>
        ` : ''}
    `;
    container.innerHTML = '';
    container.appendChild(emptyContainer);
}

// Show error state
function showErrorState(container, options, type = 'orders') {
    const errorContainer = document.createElement('div');
    errorContainer.className = `bg-white rounded-xl p-8 text-center ${type === 'wishlist' ? 'col-span-3' : ''}`;
    errorContainer.innerHTML = `
        <i class="fas fa-${options.icon} text-4xl text-red-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700 mb-2">${options.title}</h3>
        <p class="text-gray-500 mb-4">${options.message}</p>
        <button onclick="${options.action.toString().includes('()') ? options.action.toString().replace('function ', '').replace('()', '') : options.action}" 
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Retry
        </button>
    `;
    container.innerHTML = '';
    container.appendChild(errorContainer);
}

// ====================== ACTION FUNCTIONS ======================

// Cancel order
function cancelOrder(orderId) {
    Swal.fire({
        title: 'Cancel Order?',
        text: 'Are you sure you want to cancel this order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // In a real app, you would call your API:
            // fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
            
            // For now, simulate API call
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Order Cancelled',
                    text: 'Your order has been successfully cancelled.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Remove from local orders array and re-render
                    allOrders = allOrders.filter(order => order.id !== orderId);
                    renderOrders(document.getElementById('order-history'));
                });
            }, 800);
        }
    });
}

// Track order
function trackOrder(trackingId) {
    // In a real app, you would fetch tracking info from your API
    // For now, show mock tracking info
    const trackingUpdates = [
        {
            timestamp: new Date(Date.now() - 86400000 * 3),
            description: 'Order processed at warehouse'
        },
        {
            timestamp: new Date(Date.now() - 86400000 * 2),
            description: 'Shipped from distribution center'
        },
        {
            timestamp: new Date(Date.now() - 86400000 * 1),
            description: 'Arrived at local facility'
        },
        {
            timestamp: new Date(Date.now() + 86400000 * 1),
            description: 'Out for delivery'
        }
    ];
    
    Swal.fire({
        title: 'Order Tracking',
        html: `
            <div class="text-left">
                <p class="mb-2"><strong>Tracking ID:</strong> ${trackingId}</p>
                <p class="mb-4"><strong>Estimated Delivery:</strong> ${new Date(Date.now() + 86400000 * 1).toLocaleDateString()}</p>
                
                <div class="border-l-2 border-orange-500 pl-4">
                    ${trackingUpdates.map(update => `
                        <div class="mb-4">
                            <p class="font-medium">${new Date(update.timestamp).toLocaleString()}</p>
                            <p class="text-gray-600">${update.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `,
        confirmButtonText: 'Close'
    });
}

// Download invoice
function downloadInvoice(order) {
    // In a real app, you would generate or fetch a PDF invoice
    // For now, we'll create a simple HTML invoice that can be printed
    
    const invoiceWindow = window.open('', 'Invoice', 'width=800,height=1000');
    invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice #${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #ea580c; }
                .invoice-title { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
                .invoice-meta { margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
                .customer-info, .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th { text-align: left; padding: 10px; background: #f5f5f5; }
                .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">SuperShoes</div>
                <div>
                    <div class="invoice-title">INVOICE</div>
                    <div>#${order.id}</div>
                </div>
            </div>
            
            <div class="invoice-meta">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Customer Information</div>
                <div class="customer-info">
                    <div>
                        <p><strong>Name:</strong> ${currentUser.name || 'Customer'}</p>
                        <p><strong>Email:</strong> ${currentUser.email}</p>
                    </div>
                    <div>
                        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Tracking #:</strong> ${order.tracking_id}</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Order Summary</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${order.product_name}</td>
                            <td>${order.size}</td>
                            <td>${order.quantity}</td>
                            <td>₹${order.price.toLocaleString()}</td>
                            <td>₹${(order.price * order.quantity).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Subtotal: ₹${(order.price * order.quantity).toLocaleString()}</p>
                    <p>Shipping: ₹0.00</p>
                    <p>Tax: ₹${(order.price * order.quantity * 0.18).toLocaleString()}</p>
                    <p>Grand Total: ₹${(order.price * order.quantity * 1.18).toLocaleString()}</p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Payment Information</div>
                <p>Payment Method: Credit Card</p>
                <p>Payment Status: Paid</p>
            </div>
            
            <div class="footer">
                <p>Thank you for shopping with SuperShoes!</p>
                <p>If you have any questions about this invoice, please contact support@supershoes.com</p>
                <button onclick="window.print()" class="no-print" style="margin-top: 20px; padding: 10px 20px; background: #ea580c; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
            </div>
        </body>
        </html>
    `);
    invoiceWindow.document.close();
}

// Request return
function requestReturn(orderId, productId, size) {
    Swal.fire({
        title: 'Request Return',
        html: `
            <div class="text-left">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Reason for Return</label>
                    <select id="returnReason" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="Wrong size">Wrong size</option>
                        <option value="Wrong item">Wrong item</option>
                        <option value="Defective">Defective product</option>
                        <option value="No longer needed">No longer needed</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Additional Notes</label>
                    <textarea id="returnNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        preConfirm: () => {
            const reason = document.getElementById('returnReason').value;
            const notes = document.getElementById('returnNotes').value;
            
            if (!reason) {
                Swal.showValidationMessage('Please select a reason for return');
                return false;
            }
            
            return { reason, notes };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // In a real app, you would call your API:
            // fetch('/api/returns', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         orderId,
            //         productId,
            //         size,
            //         reason: result.value.reason,
            //         notes: result.value.notes,
            //         userId: currentUser.id
            //     })
            // })
            
            // For now, simulate API call
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Return Request Submitted',
                    text: 'Your return request has been received. We will process it within 2-3 business days.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Add to returns array and re-render
                    const newReturn = {
                        id: 'RET-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                        product_id: productId,
                        product_name: allOrders.find(o => o.id === orderId)?.product_name || 'Product',
                        image_url: allOrders.find(o => o.id === orderId)?.image_url || '',
                        size: size,
                        request_type: 'return',
                        status: 'Processing',
                        requested_at: new Date().toISOString(),
                        reason: result.value.reason,
                        notes: result.value.notes
                    };
                    
                    allReturns.unshift(newReturn);
                    renderReturns(document.getElementById('return-history'));
                });
            }, 800);
        }
    });
}

// Check return status
function checkReturnStatus(returnId) {
    const returnItem = allReturns.find(r => r.id === returnId);
    if (!returnItem) return;
    
    // In a real app, you would fetch the latest status from your API
    // For now, show mock status info
    const statusUpdates = [
        {
            timestamp: new Date(returnItem.requested_at),
            description: 'Return request received'
        },
        {
            timestamp: new Date(new Date(returnItem.requested_at).getTime() + 86400000),
            description: 'Return approved'
        },
        {
            timestamp: new Date(new Date(returnItem.requested_at).getTime() + 86400000 * 2),
            description: returnItem.request_type === 'return' ? 
                'Refund processing' : 
                'Exchange item being prepared'
        }
    ];
    
    Swal.fire({
        title: 'Return Status',
        html: `
            <div class="text-left">
                <p class="mb-2"><strong>Return ID:</strong> ${returnId}</p>
                <p class="mb-2"><strong>Status:</strong> <span class="font-medium">${returnItem.status}</span></p>
                <p class="mb-4"><strong>Reason:</strong> ${returnItem.reason}</p>
                
                <div class="border-l-2 border-orange-500 pl-4">
                    ${statusUpdates.map(update => `
                        <div class="mb-4">
                            <p class="font-medium">${new Date(update.timestamp).toLocaleString()}</p>
                            <p class="text-gray-600">${update.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `,
        confirmButtonText: 'Close'
    });
}

// Cancel return request
function cancelReturnRequest(returnId) {
    Swal.fire({
        title: 'Cancel Return Request?',
        text: 'Are you sure you want to cancel this return request?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // In a real app, you would call your API:
            // fetch(`/api/returns/${returnId}/cancel`, { method: 'POST' })
            
            // For now, simulate API call
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Request Cancelled',
                    text: 'Your return request has been successfully cancelled.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Update status in local array and re-render
                    const returnItem = allReturns.find(r => r.id === returnId);
                    if (returnItem) {
                        returnItem.status = 'Cancelled';
                    }
                    renderReturns(document.getElementById('return-history'));
                });
            }, 800);
        }
    });
}

// Remove from wishlist
function removeFromWishlist(index) {
    Swal.fire({
        title: 'Remove from Wishlist?',
        text: 'Are you sure you want to remove this item from your wishlist?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove from localStorage
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            wishlist.splice(index, 1);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            
            // Update UI
            allWishlistItems = wishlist;
            renderWishlist(document.getElementById('wishlist-items'));
            
            Swal.fire({
                icon: 'success',
                title: 'Removed',
                text: 'Item has been removed from your wishlist.',
                confirmButtonText: 'OK'
            });
        }
    });
}

// Move to cart
function moveToCart(index) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const item = wishlist[index];
    
    if (!item) return;
    
    // Add to cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Remove from wishlist
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Update UI
    allWishlistItems = wishlist;
    renderWishlist(document.getElementById('wishlist-items'));
    
    Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: 'Item has been moved to your shopping cart.',
        confirmButtonText: 'OK'
    });
}

// Edit profile
function editProfile() {
    Swal.fire({
        title: 'Edit Profile',
        html: `
            <div class="text-left">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Full Name</label>
                    <input id="profileName" type="text" value="${currentUser.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Email</label>
                    <input id="profileEmail" type="email" value="${currentUser.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Phone</label>
                    <input id="profilePhone" type="tel" value="${currentUser.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        preConfirm: () => {
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const phone = document.getElementById('profilePhone').value;
            
            if (!name || !email) {
                Swal.showValidationMessage('Name and email are required');
                return false;
            }
            
            return { name, email, phone };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Update user data
            currentUser = {
                ...currentUser,
                name: result.value.name,
                email: result.value.email,
                phone: result.value.phone
            };
            
            // Save to localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            
            // Update UI
            updateUserProfile();
            
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile information has been saved.',
                confirmButtonText: 'OK'
            });
        }
    });
}

// View addresses
function viewAddresses() {
    // In a real app, you would fetch addresses from your API
    const addresses = currentUser.addresses || [
        {
            id: '1',
            type: 'Home',
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA',
            isDefault: true
        }
    ];
    
    Swal.fire({
        title: 'My Addresses',
        html: `
            <div class="text-left">
                ${addresses.map(address => `
                    <div class="mb-4 p-4 border border-gray-200 rounded-lg ${address.isDefault ? 'border-orange-500 bg-orange-50' : ''}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium">${address.type} ${address.isDefault ? '(Default)' : ''}</h4>
                                <p class="text-gray-600">${address.street}</p>
                                <p class="text-gray-600">${address.city}, ${address.state} ${address.zip}</p>
                                <p class="text-gray-600">${address.country}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editAddress('${address.id}')" class="text-orange-500 hover:text-orange-700">
                                    <i class="fas fa-edit"></i>
                                </button>
                                ${!address.isDefault ? `
                                    <button onclick="deleteAddress('${address.id}')" class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <button onclick="addNewAddress()" class="w-full mt-4 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add New Address
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// Logout
function logout() {
    Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear user data
            localStorage.removeItem('loggedInUser');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    });
}