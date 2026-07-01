(function () {
  const CART_KEY = 'closetpaty_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function addToCart(productEl) {
    if (!productEl) return;
    const id = productEl.dataset.id;
    const price = parseFloat(productEl.dataset.price);
    const name = productEl.dataset.name;
    const imgEl = productEl.querySelector('.product-photo');
    const image = imgEl ? imgEl.getAttribute('src') : '';

    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, image, qty: 1 });
    saveCart(cart);
    openCart();
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(item => item.id !== id));
  }

  function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) saveCart(cart.filter(i => i.id !== id));
    else saveCart(cart);
  }

  function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderCart() {
    const cart = getCart();
    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);

    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!itemsEl) return;

    itemsEl.innerHTML = '';
    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = false;
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML =
          '<img src="' + item.image + '" alt="' + item.name + '">' +
          '<div>' +
            '<div class="cart-item-name">' + item.name + '</div>' +
            '<div class="cart-item-price">' + formatBRL(item.price) + '</div>' +
            '<div class="cart-item-qty">' +
              '<button type="button" data-action="dec">-</button>' +
              '<span>' + item.qty + '</span>' +
              '<button type="button" data-action="inc">+</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="cart-item-remove" aria-label="Remover">&times;</button>';
        row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(item.id, -1));
        row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(item.id, 1));
        row.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
        itemsEl.appendChild(row);
      });
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    if (totalEl) totalEl.textContent = formatBRL(total);
  }

  function openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
  }

  function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
  }

  async function checkout() {
    const cart = getCart();
    if (cart.length === 0) return;

    const btn = document.getElementById('checkout-btn');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Processando...'; }

    try {
      const res = await fetch('/.netlify/functions/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ id: i.id, qty: i.qty })) })
      });

      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || 'Falha ao criar pagamento');
      }
      window.location.href = data.init_point;
    } catch (err) {
      alert('Não foi possível iniciar o pagamento. Tente novamente em instantes.');
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  }

  function showBanner(message, type) {
    const banner = document.createElement('div');
    banner.className = 'checkout-banner checkout-banner-' + type;
    banner.textContent = message;
    document.body.prepend(banner);
    setTimeout(() => banner.remove(), 8000);
  }

  function handleReturnStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (!status) return;
    if (status === 'success') {
      localStorage.removeItem(CART_KEY);
      showBanner('Pagamento aprovado! Obrigada pela compra ♡', 'success');
    } else if (status === 'failure') {
      showBanner('O pagamento não foi concluído. Você pode tentar novamente.', 'error');
    } else if (status === 'pending') {
      showBanner('Pagamento em análise. Assim que for aprovado, avisaremos.', 'info');
    }
    params.delete('status');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quick-buy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(btn.closest('.product'));
      });
    });

    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) cartToggle.addEventListener('click', (e) => { e.preventDefault(); openCart(); });

    const cartClose = document.getElementById('cart-close');
    if (cartClose) cartClose.addEventListener('click', closeCart);

    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    renderCart();
    handleReturnStatus();
  });
})();
