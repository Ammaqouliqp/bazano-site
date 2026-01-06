document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  try {
    const user = await apiFetch('/users/me');

    document.getElementById('panel-username').textContent = 
      `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'کاربر عزیز';
    document.getElementById('panel-phone').textContent = user.phonenumber || '-';

    document.getElementById('buyer-firstname').textContent = user.firstname || '-';
    document.getElementById('buyer-lastname').textContent = user.lastname || '-';
    document.getElementById('buyer-phone').textContent = user.phonenumber || '-';
    document.getElementById('buyer-email').textContent = user.email || '-';

    const wallet = await apiFetch('/wallets/me');
    const balance = wallet.balance || 0;
    document.getElementById('wallet-amount').textContent = balance + ' تومان';
    document.getElementById('wallet-balance').textContent = balance + ' تومان';

    // تعداد سفارشات (درخواست‌های محصول)
    const requests = await apiFetch('/requests?buyer=true&type=product');
    document.getElementById('total-orders').textContent = requests.length || 0;

    // امتیازات (net buyer_credit - offer)
    const creditsData = await apiFetch('/api/transaction-calculations/buyer-credits');
    document.getElementById('buyer-credits').textContent = creditsData.net_credits || 0;

    // Load transactions
    const transactions = await apiFetch('/transactions?buyer=true');
    renderList('transactions-list', transactions, (tx) => `
      <tr>
        <td>${tx.transaction_code || tx.id}</td>
        <td>${tx.total_price || 0} تومان</td>
        <td>${new Date(tx.date).toLocaleDateString('fa-IR')}</td>
        <td>${tx.status || 'در حال پردازش'}</td>
      </tr>
    `, ['کد', 'مبلغ', 'تاریخ', 'وضعیت']);

    // Load requests
    const productRequests = await apiFetch('/requests?buyer=true&type=product');
    renderList('requests-list', productRequests, (req) => `
      <div class="list-group-item">
        <h5>${req.subject}</h5>
        <p>${req.message}</p>
        <small>تاریخ: ${new Date(req.date).toLocaleDateString('fa-IR')} | وضعیت: ${req.status || 'در حال بررسی'}</small>
      </div>
    `);

  } catch (err) {
    alert('خطا در بارگذاری پنل');
  }

  // Tab switching
  document.querySelectorAll('.panel-menu li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.panel-menu li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.remove('active'));
      document.getElementById(li.dataset.section).classList.add('active');
    });
  });

  // Logout
  document.getElementById('panel-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
  });
});

function renderList(containerId, items, renderItem, headers = []) {
  const container = document.getElementById(containerId);
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="text-center">موردی یافت نشد</p>';
    return;
  }

  let html = headers.length ? '<table class="table table-striped"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' : '<div class="list-group">';
  items.forEach(item => html += renderItem(item));
  html += headers.length ? '</tbody></table>' : '</div>';
  container.innerHTML = html;
}