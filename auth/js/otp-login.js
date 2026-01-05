let countdownTimer;

document.addEventListener('DOMContentLoaded', () => {
  const methodBtns = document.querySelectorAll('.method-btn');
  const inputLabel = document.getElementById('input-label');
  const identifierInput = document.getElementById('identifier');

  // تغییر بین تلفن و ایمیل
  methodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      methodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.method === 'phone') {
        inputLabel.textContent = 'شماره تلفن';
        identifierInput.placeholder = '09123456789';
        identifierInput.value = '';
      } else {
        inputLabel.textContent = 'ایمیل';
        identifierInput.placeholder = 'example@gmail.com';
        identifierInput.type = 'email';
        identifierInput.value = '';
      }
    });
  });

  // ارسال کد
  document.getElementById('send-otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = identifierInput.value.trim();
    if (!identifier) return;

    const sendBtnText = document.querySelector('#send-btn .btn-text');
    const sendBtnLoading = document.querySelector('#send-btn .btn-loading');

    sendBtnText.style.display = 'none';
    sendBtnLoading.style.display = 'flex';

    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'خطا در ارسال کد');

      // نمایش مرحله دوم
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
      document.getElementById('sent-to').textContent = `کد به ${identifier} ارسال شد`;

      // شروع تایمر
      startTimer();

      // برای تست: کد در کنسول نمایش داده می‌شود
      console.log('کد تست (برای ورود):', data.testCode || '123456');

    } catch (err) {
      document.getElementById('otp-error').textContent = err.message;
      document.getElementById('otp-error').style.display = 'block';
    } finally {
      sendBtnText.style.display = 'block';
      sendBtnLoading.style.display = 'none';
    }
  });

  // تأیید کد
  document.getElementById('verify-otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('otp-code').value.trim();

    const verifyBtnText = document.querySelector('#verify-btn .btn-text');
    const verifyBtnLoading = document.querySelector('#verify-btn .btn-loading');

    verifyBtnText.style.display = 'none';
    verifyBtnLoading.style.display = 'flex';

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'کد اشتباه است');

      localStorage.setItem('token', data.token);
      alert('ورود موفق! خوش آمدید');
      window.location.href = '../index.html';

    } catch (err) {
      document.getElementById('otp-error').textContent = err.message;
      document.getElementById('otp-error').style.display = 'block';
    } finally {
      verifyBtnText.style.display = 'block';
      verifyBtnLoading.style.display = 'none';
    }
  });

  // ارسال مجدد
  document.getElementById('resend-code').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    clearInterval(countdownTimer);
  });

  function startTimer() {
    let time = 120; // 2 دقیقه
    const timerEl = document.getElementById('timer');

    countdownTimer = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (--time < 0) {
        clearInterval(countdownTimer);
        timerEl.textContent = 'منقضی شد';
        document.getElementById('resend-code').style.pointerEvents = 'auto';
        document.getElementById('resend-code').style.color = '#ff6f00';
      }
    }, 1000);
  }
});