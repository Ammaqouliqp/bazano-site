document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill identifier from URL
  const params = new URLSearchParams(window.location.search);
  const identifier = params.get('identifier');
  if (identifier) {
    document.getElementById('identifier').value = identifier;
    document.getElementById('identifier-label').textContent = identifier.includes('@') ? 'ایمیل' : 'شماره تلفن';
  }

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, phonenumber: identifier.includes('@') ? null : identifier, email: identifier.includes('@') ? identifier : null, password })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'خطا در ثبت نام');

      localStorage.setItem('token', data.token);
      alert('ثبت نام موفق! خوش آمدید');
      window.location.href = '../index.html';

    } catch (err) {
      document.getElementById('register-error').textContent = err.message;
      document.getElementById('register-error').style.display = 'block';
    }
  });
}); 