document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Registering...';
    msg.className = 'message';
    msg.textContent = '';

    const payload = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      authCode: document.getElementById('authCode').value.trim().toUpperCase()
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        msg.textContent = data.message || 'Registration successful! Redirecting to login...';
        msg.className = 'message success';
        form.reset();
        setTimeout(() => window.location.href = '/login', 1500);
      } else {
        msg.textContent = data.message || 'Registration failed.';
        msg.className = 'message error';
      }
    } catch (err) {
      msg.textContent = 'Network error. Please check your connection.';
      msg.className = 'message error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });
});