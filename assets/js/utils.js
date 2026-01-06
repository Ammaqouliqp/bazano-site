// assets/js/utils.js - Complete fixed version (based on your original + new header logic added)

const API_BASE = '/api'; // Change to your deployment URL later

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
  if (role === 'seller') window.location.href = `${basePath}panels/seller.html`;
  else if (role === 'admin') window.location.href = `${basePath}panels/admin.html`;
  else if (role === 'buyer') window.location.href = `${basePath}panels/buyer.html`;
  else window.location.href = `${basePath}index.html`;
}

function logout() {
  removeToken();
  window.location.href = '../index.html'; // Adjust if needed
}

// ==================== NEW HEADER LOGIC ADDED ====================

$(document).ready(function () {
  updateHeaderIcons();
});

function updateHeaderIcons() {
  const isLoggedIn = !!getToken();

  // Mobile bottom bar - always show profile icon (same look logged in or not)
  $('#mobile-profile').html(`
    <a href="#" id="mobile-profile-btn">
      <i class="fas fa-user"></i>
    </a>
  `);

  if (isLoggedIn) {
    // Logged in
    $('#profile-desktop').html(`
      <a href="../profile.html">
        <i class="fas fa-user"></i>
      </a>
    `);

    // Mobile clicks
    $('#mobile-profile-btn').off('click').on('click', () => window.location.href = '../profile.html');
    $('#mobile-notif-btn').off('click').on('click', () => window.location.href = '../chat.html');
    $('#mobile-cart-btn').off('click').on('click', () => window.location.href = '../cart/cart.html');

    // Desktop clicks
    $('#notif-desktop-btn').off('click').on('click', () => window.location.href = '../chat.html');
    $('#cart-desktop-btn').off('click').on('click', () => window.location.href = '../cart/cart.html');
  } else {
    // Not logged in
    $('#profile-desktop').html(`
      <a href="../auth/login.html">
        <i class="fa fa-sign-in" aria-hidden="true"></i> ورود
      </a>
    `);

    // All clicks go to login
    const goToLogin = () => window.location.href = '../auth/login.html';

    $('#mobile-profile-btn').off('click').on('click', goToLogin);
    $('#mobile-notif-btn').off('click').on('click', goToLogin);
    $('#mobile-cart-btn').off('click').on('click', goToLogin);
    $('#notif-desktop-btn').off('click').on('click', goToLogin);
    $('#cart-desktop-btn').off('click').on('click', goToLogin);
  }
}