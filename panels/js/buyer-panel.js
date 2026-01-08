document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  try {
    const user = await apiFetch('/users/me');

    // User info
    document.getElementById('panel-username').textContent = 
      `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'کاربر عزیز';
    document.getElementById('panel-phone').textContent = user.phonenumber || '-';

    document.getElementById('buyer-firstname').textContent = user.firstname || '-';
    document.getElementById('buyer-lastname').textContent = user.lastname || '-';
    document.getElementById('buyer-phone').textContent = user.phonenumber || '-';
    document.getElementById('buyer-email').textContent = user.email || '-';

    // Wallet
    const wallet = await apiFetch('/wallets/me');
    const balance = wallet.balance || 0;
    document.getElementById('wallet-amount').textContent = balance + ' تومان';
    document.getElementById('wallet-balance').textContent = balance + ' تومان';

    // Total product requests
    const requests = await apiFetch('/requests?buyer=true');
    const productRequests = requests.filter(req => 
      req.type === 'product' || 
      req.subject.includes('محصول') || 
      req.subject.includes('سفارش')
    );
    document.getElementById('total-orders').textContent = productRequests.length;

    // Net credits - use correct endpoint (no such route in your app.js, so temporary 0)
    // If you want real credits, add the endpoint later
    document.getElementById('buyer-credits').textContent = '0'; // Temporary

    // Transactions
    const transactions = await apiFetch('/transactions?buyer=true');
    renderTable('transactions-list', transactions, ['کد', 'مبلغ', 'تاریخ', 'وضعیت'], (tx) => [
      tx.transaction_code || tx.id,
      (tx.total_price || 0) + ' تومان',
      new Date(tx.date).toLocaleDateString('fa-IR'),
      tx.status || 'در حال پردازش'
    ], 'تراکنشی یافت نشد');

    // Product requests (orders tab)
    renderList('orders-list', productRequests, (req) => `
      <div class="list-group-item">
        <h5>${req.subject}</h5>
        <p>${req.message || 'بدون توضیح'}</p>
        <small>تاریخ: ${new Date(req.date).toLocaleDateString('fa-IR')} | وضعیت: ${req.status || 'در حال بررسی'}</small>
      </div>
    `, 'سفارش محصولی یافت نشد');

    // All requests
    renderList('requests-list', requests, (req) => `
      <div class="list-group-item">
        <h5>${req.subject}</h5>
        <p>${req.message || 'بدون توضیح'}</p>
        <small>تاریخ: ${new Date(req.date).toLocaleDateString('fa-IR')} | وضعیت: ${req.status || 'در حال بررسی'}</small>
      </div>
    `, 'درخواستی یافت نشد');

  } catch (err) {
    console.error('Buyer panel error:', err);
    alert('خطا در بارگذاری پنل خریدار: ' + (err.message || 'نامشخص'));
  }

  // Tab switching
  document.querySelectorAll('.panel-menu li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.panel-menu li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.remove('active'));
      document.getElementById(li.dataset.section)?.classList.add('active');
    });
  });

  // Logout
  document.getElementById('panel-logout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
  });
});

function renderTable(id, items, headers, mapper, empty = 'موردی یافت نشد') {
  const container = document.getElementById(id);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-center text-muted mt-4">${empty}</p>`;
    return;
  }

  let html = '<table class="table table-striped"><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  items.forEach(item => {
    html += '<tr>';
    mapper(item).forEach(cell => html += `<td>${cell}</td>`);
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderList(id, items, mapper, empty = 'موردی یافت نشد') {
  const container = document.getElementById(id);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-center text-muted mt-4">${empty}</p>`;
    return;
  }

  let html = '<div class="list-group">';
  items.forEach(item => html += mapper(item));
  html += '</div>';
  container.innerHTML = html;
}