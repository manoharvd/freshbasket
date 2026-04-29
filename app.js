// ============================================================
//  FreshBasket — app.js
//  All interactivity: cart, filters, search, favourites, toast
// ============================================================

// ── PRODUCT DATA ──────────────────────────────────────────────
const products = [
  { id:1,  name:'Organic Apples',   unit:'1 kg bag',      price:3.99, oldPrice:5.49, emoji:'🍎', category:'fruits',     badge:'Organic'     },
  { id:2,  name:'Ripe Bananas',     unit:'500g bunch',    price:1.49, oldPrice:null, emoji:'🍌', category:'fruits',     badge:null          },
  { id:3,  name:'Strawberries',     unit:'250g punnet',   price:2.99, oldPrice:4.49, emoji:'🍓', category:'fruits',     badge:'Sale'        },
  { id:4,  name:'Avocados',         unit:'Pack of 3',     price:4.49, oldPrice:null, emoji:'🥑', category:'fruits',     badge:null          },
  { id:5,  name:'Broccoli',         unit:'1 head ~400g',  price:1.79, oldPrice:null, emoji:'🥦', category:'vegetables', badge:null          },
  { id:6,  name:'Cherry Tomatoes',  unit:'400g tray',     price:2.29, oldPrice:3.49, emoji:'🍅', category:'vegetables', badge:'Fresh'       },
  { id:7,  name:'Baby Spinach',     unit:'200g bag',      price:2.49, oldPrice:null, emoji:'🥬', category:'vegetables', badge:null          },
  { id:8,  name:'Carrots',          unit:'1 kg bag',      price:1.29, oldPrice:null, emoji:'🥕', category:'vegetables', badge:null          },
  { id:9,  name:'Whole Milk',       unit:'2L bottle',     price:2.89, oldPrice:null, emoji:'🥛', category:'dairy',      badge:null          },
  { id:10, name:'Greek Yogurt',     unit:'500g tub',      price:3.49, oldPrice:4.29, emoji:'🫙', category:'dairy',      badge:'Sale'        },
  { id:11, name:'Cheddar Cheese',   unit:'400g block',    price:4.99, oldPrice:null, emoji:'🧀', category:'dairy',      badge:null          },
  { id:12, name:'Sourdough Loaf',   unit:'800g loaf',     price:3.79, oldPrice:null, emoji:'🍞', category:'bakery',     badge:'Baked Fresh' },
  { id:13, name:'Croissants',       unit:'Pack of 4',     price:3.29, oldPrice:null, emoji:'🥐', category:'bakery',     badge:null          },
  { id:14, name:'Chicken Breast',   unit:'500g pack',     price:5.99, oldPrice:7.49, emoji:'🍗', category:'meat',       badge:'Sale'        },
  { id:15, name:'Salmon Fillet',    unit:'300g fillet',   price:7.49, oldPrice:null, emoji:'🐟', category:'meat',       badge:null          },
  { id:16, name:'Potato Crisps',    unit:'175g bag',      price:1.99, oldPrice:null, emoji:'🥔', category:'snacks',     badge:null          },
  { id:17, name:'Dark Chocolate',   unit:'100g bar',      price:2.49, oldPrice:null, emoji:'🍫', category:'snacks',     badge:null          },
  { id:18, name:'Orange Juice',     unit:'1L carton',     price:2.99, oldPrice:3.79, emoji:'🧃', category:'beverages',  badge:'Sale'        },
  { id:19, name:'Sparkling Water',  unit:'1.5L bottle',   price:0.99, oldPrice:null, emoji:'💧', category:'beverages',  badge:null          },
  { id:20, name:'Green Tea',        unit:'20 bags',       price:2.29, oldPrice:null, emoji:'🍵', category:'beverages',  badge:null          },
];

// ── APP STATE ─────────────────────────────────────────────────
let cart = {};               // { productId: quantity }
let currentCategory = 'all'; // active category filter
let searchQuery = '';         // active search text
let favorites = new Set();   // set of favourited product IDs

// ── FILTERING ─────────────────────────────────────────────────

/**
 * Returns products filtered by the active category and search query.
 */
function getFilteredProducts() {
  return products.filter(p => {
    const matchCat    = currentCategory === 'all' || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
}

// ── RENDERING ────────────────────────────────────────────────

/**
 * Clears and re-renders the product grid based on current filters.
 */
function renderProducts() {
  const grid     = document.getElementById('productsGrid');
  const filtered = getFilteredProducts();

  document.getElementById('productCount').textContent = `${filtered.length} items`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">
        <div style="font-size:3rem;margin-bottom:12px">🔍</div>
        <p>No products found.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const qty   = cart[p.id] || 0;
    const isFav = favorites.has(p.id);
    return `
      <div class="product-card" id="card-${p.id}">
        <div class="product-img">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <span style="font-size:3.8rem">${p.emoji}</span>
          <button class="product-fav" onclick="toggleFav(${p.id}, event)" title="Favourite">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-unit">${p.unit}</div>
          <div class="product-footer">
            <div class="product-price">
              $${p.price.toFixed(2)}
              ${p.oldPrice ? `<span class="old">$${p.oldPrice.toFixed(2)}</span>` : ''}
            </div>
            ${qty === 0
              ? `<button class="add-btn" onclick="addToCart(${p.id})" title="Add to cart">+</button>`
              : `<div class="qty-controls" id="qty-${p.id}" style="display:flex">
                   <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
                   <span class="qty-num" id="qnum-${p.id}">${qty}</span>
                   <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
                 </div>`
            }
          </div>
        </div>
      </div>`;
  }).join('');
}

/**
 * Renders the cart sidebar: item list, subtotal, delivery, and total.
 */
function renderCartSidebar() {
  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const keys     = Object.keys(cart);

  // Empty state
  if (keys.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty.<br>Start adding some fresh items!</p>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  // Render items and calculate subtotal
  let subtotal = 0;
  itemsEl.innerHTML = keys.map(id => {
    const p   = products.find(x => x.id == id);
    const qty = cart[id];
    subtotal += p.price * qty;
    return `
      <div class="cart-item">
        <div class="cart-item-icon">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${(p.price * qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${id}, -1)" style="width:26px;height:26px;font-size:.9rem">−</button>
          <span>${qty}</span>
          <button class="qty-btn" onclick="changeQty(${id}, 1)" style="width:26px;height:26px;font-size:.9rem">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${id})">✕</button>
      </div>`;
  }).join('');

  // Free delivery over $40
  const delivery = subtotal >= 40 ? 0 : 4.99;
  document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cartDelivery').textContent = delivery === 0 ? 'FREE 🎉' : `$${delivery.toFixed(2)}`;
  document.getElementById('cartTotal').textContent    = `$${(subtotal + delivery).toFixed(2)}`;
  footerEl.style.display = 'block';
}

// ── CART ACTIONS ──────────────────────────────────────────────

/**
 * Adds 1 unit of a product to the cart.
 */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartUI();
  renderProducts();
  const p = products.find(x => x.id === id);
  showToast(`${p.emoji} ${p.name} added to cart!`);
}

/**
 * Changes the quantity of a cart item by delta (+1 or -1).
 * Removes the item if quantity drops to 0.
 */
function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
  renderProducts();
}

/**
 * Completely removes a product from the cart.
 */
function removeItem(id) {
  delete cart[id];
  updateCartUI();
  renderProducts();
}

/**
 * Updates the cart badge count and re-renders the sidebar.
 */
function updateCartUI() {
  const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  document.getElementById('cartCount').textContent = total;
  renderCartSidebar();
}

// ── CART SIDEBAR TOGGLE ───────────────────────────────────────

/**
 * Slides the cart sidebar in or out.
 */
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

// ── CHECKOUT ─────────────────────────────────────────────────

/**
 * Demo checkout — shows a success message and clears the cart.
 * NOTE: This does NOT process real payment. Integrate Stripe or
 * PayPal to charge users.
 */
function checkout() {
  showToast('🎉 Order placed! Thank you for shopping with FreshBasket.');
  cart = {};
  updateCartUI();
  toggleCart();
}

// ── FAVOURITES ────────────────────────────────────────────────

/**
 * Toggles a product's favourite status.
 * Uses e.stopPropagation() to prevent card click bubbling.
 */
function toggleFav(id, e) {
  e.stopPropagation();
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  renderProducts();
}

// ── FILTERS ──────────────────────────────────────────────────

/**
 * Switches the active category and re-renders.
 */
function filterCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  const titles = {
    all:        'Featured Products',
    fruits:     'Fresh Fruits',
    vegetables: 'Fresh Vegetables',
    dairy:      'Dairy & Eggs',
    bakery:     'Bakery',
    meat:       'Meat & Fish',
    snacks:     'Snacks',
    beverages:  'Drinks'
  };
  document.getElementById('productsTitle').textContent = titles[cat] || 'Products';
  renderProducts();
}

/**
 * Updates the search query and re-renders products.
 */
function filterProducts() {
  searchQuery = document.getElementById('searchInput').value;
  renderProducts();
}

// ── TOAST NOTIFICATION ────────────────────────────────────────

/**
 * Shows a temporary notification at the bottom of the screen.
 * @param {string} msg - The message to display.
 */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── INIT ─────────────────────────────────────────────────────
renderProducts();
renderCartSidebar();
