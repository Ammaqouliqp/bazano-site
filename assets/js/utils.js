const API_BASE = 'http://localhost:3000/api'; // Change to your deployment URL later

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

async function getUserRole() {
  try {
    const user = await apiFetch('/users/me');
    return user.role;
  } catch {
    return null;
  }
}

function redirectToPanel(role) {
  const basePath = window.location.pathname.startsWith('/panels/') ? '../' : '';
  if (role === 'seller') window.location.href = `../panels/seller.html`;
  else if (role === 'admin') window.location.href = `../panels/admin.html`;
  else if (role === 'buyer') window.location.href = `../panels/buyer.html`;
  else window.location.href = `../index.html`;
}

function logout() {
  removeToken();
  window.location.href = '../index.html'; // Adjust if needed
}

async function updateNav() {
  const token = getToken();
  const navMenu = document.querySelector('.main-menu ul'); // Adjust selector to match your nav
  if (navMenu) {
    if (token) {
      const role = await getUserRole();
      navMenu.innerHTML += `<li><a href="../panels/${role}.html">داشبورد</a></li><li><a href="#" onclick="logout()">خروج</a></li>`;
    } else {
      navMenu.innerHTML += `<li><a href="../auth/login.html">ورود</a></li><li><a href="../auth/register.html">ثبت نام</a></li>`;
    }
  }
}
// utils.js

// ========== Utility Functions (keep your existing ones if you have them) ==========

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

async function apiFetch(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

async function getUserRole() {
    try {
        const user = await apiFetch('/users/me');
        return user.role;
    } catch {
        return null;
    }
}

function logout() {
    removeToken();
    window.location.href = '../index.html';
}

// ========== Header Authentication & UI Update ==========
function updateHeaderAuth() {
    const isLoggedIn = !!getToken();

    // Desktop elements
    const $notifLi = $('#notif-li');
    const $profileLi = $('#profile-li');

    // Mobile bottom bar elements (if you added them)
    const $mobileProfile = $('#mobile-profile-bottom');
    const $mobileNotif   = $('#mobile-notif-bottom');

    if (isLoggedIn) {
        // Show notification icon (both desktop & mobile)
        $notifLi.show();

        // Desktop profile → user icon
        $profileLi.html(`
            <a href="#" id="profile-btn">
                <i class="fas fa-user"></i>
            </a>
        `);

        // Mobile profile click → go to dashboard
        $mobileProfile.off('click').on('click', async function(e) {
            e.preventDefault();
            const role = await getUserRole();
            if (role) {
                window.location.href = `../panels/${role}.html`;
            } else {
                window.location.href = '../auth/login.html';
            }
        });

        // Load notification count
        loadNotificationCount();
    } 
    else {
        // Hide notification icon
        $notifLi.hide();

        // Desktop profile → login link
        $profileLi.html(`
            <a href="../auth/login.html" class="login-text">
                ورود یا ثبت نام <i class="fas fa-arrow-left"></i>
            </a>
        `);

        // Mobile profile → go to login
        $mobileProfile.off('click').on('click', function() {
            window.location.href = '../auth/login.html';
        });
    }

    // Optional: Notification click behavior (both desktop & mobile)
    $('#notif-btn, #mobile-notif-bottom').off('click').on('click', function(e) {
        e.preventDefault();
        // You can show a dropdown, open a notifications page, etc.
        // Example:
        // window.location.href = '../notifications.html';
        // or show a modal / sidebar
        alert('Notifications (to be implemented)');
    });
}

// ========== Load notification count ==========
async function loadNotificationCount() {
    try {
        const data = await apiFetch('/notifications');
        const count = data.count || 0;

        // Desktop badge
        const $notifCount = $('#notif-count');
        // Mobile badge (if you added it)
        const $mobileNotifCount = $('#mobile-notif-count');

        if (count > 0) {
            $notifCount.text(count).show();
            $mobileNotifCount?.text(count).show();
        } else {
            $notifCount.hide();
            $mobileNotifCount?.hide();
        }
    } catch (err) {
        console.error('Failed to load notification count:', err);
        $('#notif-count, #mobile-notif-count').hide();
    }
}

// ========== Document ready ==========
$(document).ready(function() {
    // Update header on every page load
    updateHeaderAuth();

    // Optional: re-check when token changes (if you have login/logout on same page)
    // You can also call updateHeaderAuth() after successful login/logout
});