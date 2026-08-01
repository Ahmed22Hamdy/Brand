/* main.js — handles cart, filters, UI interactions
   - Cart stored in localStorage (ready for backend integration)
   - Product data is a sample dataset for frontend demo
*/

const PRODUCTS = [
  {id:'p1', name:'Sleek Leather Jacket', price:249, category:'men', img:'https://images.unsplash.com/photo-1520975913930-0d69be9fb045?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7g8h9i0j', pop: 95},
  {id:'p2', name:'Modern Knit Sweater', price:129, category:'men', img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=0f3d3d7a5e3b984c7f16f3f8b1f3b4ec', pop: 88},
  {id:'p3', name:'Tailored Blazer', price:199, category:'men', img:'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=ef3b2a9f2a1e3b6f9a0b', pop: 90},
  {id:'p4', name:'Classic White Tee', price:49, category:'men', img:'https://images.unsplash.com/photo-1520975913930-0d69be9fb045?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7g8h9i0j', pop: 99},
  {id:'p5', name:'Silk Scarf', price:79, category:'women', img:'https://images.unsplash.com/photo-1503342452485-86f7d5456f93?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc123', pop: 70},
  {id:'p6', name:'Relaxed Trench', price:189, category:'women', img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=0f3d3d7a5e3b984c7f16f3f8b1f3b4ec', pop:85}
];

/* ---------- Utilities ---------- */
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}

/* ---------- Cart Logic ---------- */
function getCart(){
  try{
    return JSON.parse(localStorage.getItem('bp_cart')) || {};
  }catch(e){return {}}
}
function saveCart(cart){localStorage.setItem('bp_cart', JSON.stringify(cart)); updateCartUI();}

function addToCart(productId, qty=1){
  const cart = getCart();
  cart[productId] = cart[productId] ? cart[productId] + qty : qty;
  saveCart(cart);
}

function removeFromCart(productId){
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}

function setQuantity(productId, qty){
  const cart = getCart();
  if(qty <= 0){ delete cart[productId]; }
  else cart[productId] = qty;
  saveCart(cart);
}

function cartCount(){
  const cart = getCart();
  return Object.values(cart).reduce((s,n)=>s+Number(n),0);
}

function cartItemsDetailed(){
  const cart = getCart();
  return Object.keys(cart).map(id=>{
    const p = PRODUCTS.find(x=>x.id===id) || {id, name:'Unknown', price:0, img:''};
    return {...p, qty:cart[id], total: p.price * cart[id]};
  });
}

/* Update cart count in navbar badges */
function updateCartUI(){
  const count = cartCount();
  qs('#cart-count') && (qs('#cart-count').textContent = count);
  qs('#cart-count-2') && (qs('#cart-count-2').textContent = count);
}

/* ---------- Product rendering ---------- */
function renderProductCard(p){
  const div = document.createElement('div');
  div.className = 'col-6 col-md-4 col-lg-3 fade-in';
  div.innerHTML = `
    <div class="card product-card border-0 h-100 shadow-sm">
      <div class="position-relative overflow-hidden">
        <img src="${p.img}" alt="${p.name}" class="card-img-top product-img">
      </div>
      <div class="card-body px-2 pt-3 pb-3">
        <h6 class="card-title mb-1">${p.name}</h6>
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <strong>$${p.price}</strong>
            <div class="text-gold small">${'★'.repeat(Math.round((p.pop||80)/20))}</div>
          </div>
          <button class="btn btn-sm btn-outline-dark add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}">Add</button>
        </div>
      </div>
    </div>
  `;
  return div;
}

/* Populate shop grid */
function populateProductsGrid(containerSelector, filter={}){
  const container = qs(containerSelector);
  if(!container) return;
  container.innerHTML = '';
  let items = PRODUCTS.slice();
  if(filter.category && filter.category !== 'all') items = items.filter(i=>i.category===filter.category);
  if(filter.maxPrice) items = items.filter(i=>i.price <= filter.maxPrice);
  if(filter.q) items = items.filter(i=>i.name.toLowerCase().includes(filter.q.toLowerCase()));
  if(filter.sort){
    if(filter.sort === 'price-asc') items.sort((a,b)=>a.price-b.price);
    if(filter.sort === 'price-desc') items.sort((a,b)=>b.price-a.price);
    if(filter.sort === 'new') items.sort((a,b)=>b.id.localeCompare(a.id));
    if(filter.sort === 'popular') items.sort((a,b)=>b.pop - a.pop);
  }
  items.forEach(p=>container.appendChild(renderProductCard(p)));
  qs('#resultsCount') && (qs('#resultsCount').textContent = `Showing ${items.length} result(s)`);
}

/* ---------- Cart Page Rendering ---------- */
function renderCartPage(){
  const list = qs('#cartItems');
  if(!list) return;
  const items = cartItemsDetailed();
  list.innerHTML = '';
  if(items.length === 0){
    list.innerHTML = '<div class="text-muted">Your cart is empty.</div>';
  }
  items.forEach(item=>{
    const el = document.createElement('div');
    el.className = 'list-group-item d-flex align-items-center';
    el.innerHTML = `
      <img src="${item.img}" alt="" class="me-3 rounded" style="width:80px;height:80px;object-fit:cover">
      <div class="flex-grow-1">
        <h6 class="mb-1">${item.name}</h6>
        <div class="small text-muted">$${item.price} each</div>
        <div class="mt-2 d-flex align-items-center">
          <button class="btn btn-sm btn-outline-secondary me-2 qty-decrease" data-id="${item.id}">-</button>
          <input type="number" class="form-control form-control-sm qty-input" value="${item.qty}" min="1" style="width:70px">
          <button class="btn btn-sm btn-outline-secondary ms-2 qty-increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <div class="text-end">
        <div><strong>$${item.total.toFixed(2)}</strong></div>
        <button class="btn btn-sm btn-link text-danger remove-item" data-id="${item.id}">Remove</button>
      </div>
    `;
    // attach events
    el.querySelector('.qty-decrease').addEventListener('click', ()=>{
      setQuantity(item.id, item.qty - 1);
      renderCartPage();
    });
    el.querySelector('.qty-increase').addEventListener('click', ()=>{
      setQuantity(item.id, item.qty + 1);
      renderCartPage();
    });
    el.querySelector('.qty-input').addEventListener('change', (e)=>{
      const v = parseInt(e.target.value) || 1; setQuantity(item.id, v); renderCartPage();
    });
    el.querySelector('.remove-item').addEventListener('click', ()=>{ removeFromCart(item.id); renderCartPage(); });
    list.appendChild(el);
  });
  // summary
  const subtotal = items.reduce((s,i)=>s + i.total, 0);
  const shipping = subtotal > 150 ? 0 : (subtotal===0?0:10);
  const total = subtotal + shipping;
  qs('#subtotal') && (qs('#subtotal').textContent = `$${subtotal.toFixed(2)}`);
  qs('#shipping') && (qs('#shipping').textContent = shipping===0? 'Free' : `$${shipping.toFixed(2)}`);
  qs('#total') && (qs('#total').textContent = `$${total.toFixed(2)}`);
  updateCartUI();
}

/* ---------- Event Delegation for add-to-cart buttons ---------- */
function attachAddToCartHandlers(){
  document.body.addEventListener('click', function(e){
    const btn = e.target.closest('.add-to-cart');
    if(!btn) return;
    const id = btn.dataset.id;
    addToCart(id, 1);
    // simple feedback
    btn.classList.add('btn-success');
    setTimeout(()=>btn.classList.remove('btn-success'),600);
  });
}

/* ---------- Filters on shop page ---------- */
function initShopFilters(){
  const search = qs('#searchInput');
  const cat = qs('#categoryFilter');
  const price = qs('#priceRange');
  const priceVal = qs('#priceVal');
  const sort = qs('#sortSelect');
  const clear = qs('#clearFilters');

  function apply(){
    populateProductsGrid('#productsGrid',{
      q: search ? search.value : '',
      category: cat? cat.value : 'all',
      maxPrice: price ? Number(price.value) : 500,
      sort: sort ? sort.value : 'new'
    });
  }

  search && search.addEventListener('input', apply);
  cat && cat.addEventListener('change', apply);
  price && price.addEventListener('input', ()=>{ priceVal.textContent = `$${price.value}`; apply(); });
  sort && sort.addEventListener('change', apply);
  clear && clear.addEventListener('click', ()=>{ if(search) search.value=''; if(cat) cat.value='all'; if(price) price.value=500; if(sort) sort.value='new'; apply(); });

  apply();
}

/* ---------- Page initializers ---------- */
function initIndexPage(){
  // nothing heavy here; add handlers
  attachAddToCartHandlers();
}

function initShopPage(){
  populateProductsGrid('#productsGrid',{});
  initShopFilters();
  attachAddToCartHandlers();
}
function initMenPage(){
  // filter men
  populateProductsGrid('#menGrid',{category:'men'});
  attachAddToCartHandlers();
}
function initWomenPage(){
  populateProductsGrid('#womenGrid',{category:'women'});
  attachAddToCartHandlers();
}
function initCartPage(){
  renderCartPage();
  qs('#checkoutBtn') && qs('#checkoutBtn').addEventListener('click', ()=>{
    alert('Checkout is not implemented in this demo. Ready for backend integration.');
  });
}

/* ---------- UI extras: dark mode, scroll top, loading overlay ---------- */
function initUIExtras(){
  // dark mode toggle(s)
  const toggles = qsa('#darkModeToggle, #darkModeToggle2');
  toggles.forEach(t=>{
    t && t.addEventListener('change', (e)=>{
      document.documentElement.classList.toggle('dark-mode', e.target.checked);
    });
  });

  // scroll-to-top
  const st = qs('#scrollTopBtn') || qs('#scrollTopBtn2');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 300){ st && (st.style.display = 'inline-block'); }
    else st && (st.style.display = 'none');
  });
  st && st.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

  // loading overlay
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      const overlay = qs('#loading-overlay');
      if(overlay){ overlay.style.opacity = 0; overlay.style.pointerEvents='none'; setTimeout(()=>overlay.remove(),400); }
    },500);
  });

  // newsletter form demo
  const nf = qs('#newsletterForm');
  nf && nf.addEventListener('submit', (e)=>{ e.preventDefault(); alert('Thank you for subscribing!'); nf.reset(); });

  // contact form demo
  const cf = qs('#contactForm');
  cf && cf.addEventListener('submit', (e)=>{ e.preventDefault(); alert('Message received — we will contact you shortly.'); cf.reset(); });
}

/* ---------- Init on DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartUI();
  initUIExtras();
  // Determine page
  const path = location.pathname.toLowerCase();
  if(path.endsWith('index.html') || path.endsWith('/') ){
    initIndexPage();
  }
  if(path.endsWith('shop.html')) initShopPage();
  if(path.endsWith('men.html')) initMenPage();
  if(path.endsWith('women.html')) initWomenPage();
  if(path.endsWith('cart.html')) initCartPage();
  // attach generic handlers
  attachAddToCartHandlers();
});

// expose for debugging
window.bp = { PRODUCTS, getCart, addToCart, removeFromCart, setQuantity };