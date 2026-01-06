    document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const phonenumber = document.getElementById('phonenumber').value.trim();
    const password = document.getElementById('password').value;
    const btnText = document.querySelector('#login-btn .btn-text');
    const btnLoading = document.querySelector('#login-btn .btn-loading');
    const errorDiv = document.getElementById('login-error');

    // Reset
    errorDiv.style.display = 'none';
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';

    try {
        const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phonenumber, password })
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.error || 'اطلاعات ورود اشتباه است');
        }

        // Success
        localStorage.setItem('token', data.token);
        alert('ورود موفق! خوش آمدید');
        window.location.href = '../index.html';

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    } finally {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
    });