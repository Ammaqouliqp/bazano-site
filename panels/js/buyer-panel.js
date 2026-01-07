// panels/js/buyer-panel.js - Complete Buyer Panel Script

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  try {
    // Load user data
    const user = await apiFetch('/users/me');

    // Fill user info in sidebar and profile tab
    document.getElementById('panel-username').textContent = 
      `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'کاربر عزیز';
    document.getElementById('panel-phone').textContent = user.phonenumber || '-';

    document.getElementById('buyer-firstname').textContent = user.firstname || '-';
    document.getElementById('buyer-lastname').textContent = user.lastname || '-';
    document.getElementById('buyer-phone').textContent = user.phonenumber || '-';
    document.getElementById('buyer-email').textContent = user.email || '-';

    // Wallet balance
    const wallet = await apiFetch('/wallets/me');
    const balance = wallet.balance || 0;
    document.getElementById('wallet-amount').textContent = balance + ' تومان';
    document.getElementById('wallet-balance').textContent = balance + ' تومان';

    // Total product requests (orders)
    const allRequests = await apiFetch('/requests?buyer=true');
    const productRequests = allRequests.filter(req => 
      req.type === 'product' || 
      req.subject.toLowerCase().includes('محصول') || 
      req.subject.toLowerCase().includes('سفارش')
    );
    document.getElementById('total-orders').textContent = productRequests.length;

    // Net buyer credits (buyer_credit - offer)
    const creditsData = await apiFetch('/transaction-calculations/buyer-credits');
    const netCredits = creditsData.net_credits || 0;
    document.getElementById('buyer-credits').textContent = netCredits;

    // Load transactions
    const transactions = await apiFetch('/transactions?buyer=true');
    renderTable('transactions-list', transactions, 
      ['کد', 'مبلغ', 'تاریخ', 'وضعیت'],
      (tx) => [
        tx.transaction_code || tx.id,
        (tx.total_price || 0) + ' تومان',
        new Date(tx.date).toLocaleDateString('fa-IR'),
        tx.status || 'در حال پردازش'
      ],
      'تراکنشی یافت نشد'
    );

    // Load product requests
    renderList('requests-list', productRequests,
      (req) => `
        <div class="list-group-item">
          <h5>${req.subject}</h5>
          <p>${req.message || 'بدون توضیح'}</p>
          <small>تاریخ: ${new Date(req.date).toLocaleDateString('fa-IR')} | وضعیت: ${req.status || 'در حال بررسی'}</small>
        </div>
      `,
      'درخواست محصولی یافت نشد'
    );

  } catch (err) {
    console.error('Buyer panel load error:', err);
    alert('خطا در بارگذاری پنل خریدار');
  }

  // Tab switching
  document.querySelectorAll('.panel-menu li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.panel-menu li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');

      const section = li.dataset.section;
      document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.remove('active'));
      document.getElementById(section)?.classList.add('active');
    });
  });

  // Logout
  document.getElementById('panel-logout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
  });
});

// Reusable table renderer
function renderTable(containerId, items, headers, rowMapper, emptyMessage = 'موردی یافت نشد') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-center text-muted mt-4">${emptyMessage}</p>`;
    return;
  }

  let html = '<table class="table table-striped"><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  items.forEach(item => {
    html += '<tr>';
    rowMapper(item).forEach(cell => html += `<td>${cell}</td>`);
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Reusable list renderer
function renderList(containerId, items, renderItem, emptyMessage = 'موردی یافت نشد') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-center text-muted mt-4">${emptyMessage}</p>`;
    return;
  }

  let html = '<div class="list-group">';
  items.forEach(item => html += renderItem(item));
  html += '</div>';
  container.innerHTML = html;
}