document.addEventListener('DOMContentLoaded', () => {
  // Get phone from URL (from OTP step)
  const params = new URLSearchParams(window.location.search);
  const phonenumber = params.get('identifier');

  if (phonenumber) {
    document.getElementById('phonenumber').value = phonenumber;
  } else {
    alert('خطا: شماره تلفن یافت نشد');
    window.location.href = 'login.html';
  }

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const phonenumber = document.getElementById('phonenumber').value.trim();
    const email = document.getElementById('email').value.trim(); // Optional
    const password = document.getElementById('password').value;

    if (!firstname || !lastname || !password) {
      alert('لطفاً نام، نام خانوادگی و رمز عبور را وارد کنید');
      return;
    }
    // Validate name/lastname (no digits)
    if (!/^[آ-یa-zA-Z\s]+$/.test(firstname) || !/^[آ-یa-zA-Z\s]+$/.test(lastname)) {
    alert('نام و نام خانوادگی فقط می‌تواند شامل حروف باشد');
    return;
    }

    // Validate email if provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    alert('ایمیل وارد شده معتبر نیست');
    return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname,
          lastname,
          phonenumber,
          email: email || null, // Save empty if not filled
          password
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'خطا در ثبت نام');

      localStorage.setItem('token', data.token);
      alert('ثبت نام موفق! خوش آمدید');
      window.location.href = '../index.html';

    } catch (err) {
      alert(err.message);
    }
  });
});