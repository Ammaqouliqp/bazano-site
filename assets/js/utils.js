// assets/js/utils.js - Final improved version

const API_BASE = '/api'; // Perfect - relative path

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

// Improved apiFetch with better error handling
async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('apiFetch error:', err);
    throw err; // Let caller handle it
  }
}

// Optional: getUserRole (if you use it)
async function getUserRole() {
  try {
    const user = await apiFetch('/users/me');
    return user.role || 'buyer'; // default to buyer
  } catch {
    return null;
  }
}

// Optional: redirectToPanel (keep if needed)
function redirectToPanel(role) {
  const basePath = window.location.pathname.includes('/panels/') ? '../' : '';
  const paths = {
    seller: 'panels/seller.html',
    admin: 'panels/admin.html',
    manager: 'panels/manager.html',
    buyer: 'panels/buyer.html'
  };
  window.location.href = `${basePath}${paths[role] || 'index.html'}`;
}

// Logout
function logout() {
  removeToken();
  window.location.href = '/index.html'; // Root-relative is safer
}

// Header Update - Perfect as is
$(document).ready(function () {
  updateHeaderIcons();
});

function updateHeaderIcons() {
  const isLoggedIn = !!getToken();

  $('#mobile-profile').html(`
    <a href="#" id="mobile-profile-btn">
      <i class="fas fa-user"></i>
    </a>
  `);

  if (isLoggedIn) {
    $('#profile-desktop').html(`
      <a href="../profile.html">
        <i class="fas fa-user"></i>
      </a>
    `);

    $('#mobile-profile-btn').off('click').on('click', () => location.href = '../profile.html');
    $('#mobile-notif-btn').off('click').on('click', () => location.href = '../chat.html');
    $('#mobile-cart-btn').off('click').on('click', () => location.href = '../cart/cart.html');
    $('#notif-desktop-btn').off('click').on('click', () => location.href = '../chat.html');
    $('#cart-desktop-btn').off('click').on('click', () => location.href = '../cart/cart.html');
  } else {
    $('#profile-desktop').html(`
      <a href="../auth/login.html">
        <i class="fa fa-sign-in" aria-hidden="true"></i> ورود
      </a>
    `);

    const goToLogin = () => location.href = '../auth/login.html';
    $('#mobile-profile-btn').off('click').on('click', goToLogin);
    $('#mobile-notif-btn').off('click').on('click', goToLogin);
    $('#mobile-cart-btn').off('click').on('click', goToLogin);
    $('#notif-desktop-btn').off('click').on('click', goToLogin);
    $('#cart-desktop-btn').off('click').on('click', goToLogin);
  }
}