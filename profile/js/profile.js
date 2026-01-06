
  document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '../auth/login.html';
      return;
    }

    try {
      const user = await apiFetch('/users/me');

      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text || '-';
      };

      setText('user-name', `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'کاربر عزیز');
      setText('user-phone', user.phonenumber || 'نامشخص');
      setText('profile-firstname', user.firstname);
      setText('profile-lastname', user.lastname);
      setText('profile-phonenumber', user.phonenumber);
      setText('profile-email', user.email);

      const wallet = await apiFetch('/wallets/me');
      setText('profile-wallet', (wallet.balance || 0) + ' تومان');

    } catch (err) {
      console.error(err);
      alert('خطا در بارگذاری پروفایل: ' + (err.message || 'نامشخص'));
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '../index.html';
      });
    }
  });
