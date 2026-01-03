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
  if (role === 'seller') window.location.href = `${basePath}panels/seller.html`;
  else if (role === 'admin') window.location.href = `${basePath}panels/admin.html`;
  else if (role === 'buyer') window.location.href = `${basePath}panels/buyer.html`;
  else window.location.href = `${basePath}index.html`;
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
      navMenu.innerHTML += `<li><a href="panels/${role}.html">داشبورد</a></li><li><a href="#" onclick="logout()">خروج</a></li>`;
    } else {
      navMenu.innerHTML += `<li><a href="auth/login.html">ورود</a></li><li><a href="auth/register.html">ثبت نام</a></li>`;
    }
  }
}