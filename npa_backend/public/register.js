document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('message');

  if (!form) return;

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
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        msg.textContent = data.message || 'Registration successful! Redirecting to login...';
        msg.className = 'message success';
        form.reset();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        msg.textContent = data.message || 'Registration failed. Please check your details.';
        msg.className = 'message error';
        form.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => form.style.animation = '', 300);
      }
    } catch (err) {
      console.error('Registration error:', err);
      msg.textContent = 'Network error. Please check your connection and try again.';
      msg.className = 'message error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });

  // Add shake animation
  if (!document.querySelector('style').textContent.includes('@keyframes shake')) {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }
    `;
    document.head.appendChild(style);
  }
});