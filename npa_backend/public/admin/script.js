  document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const btn = document.getElementById('loginBtn');
      const errorEl = document.getElementById('errorMsg');
      const successEl = document.getElementById('successMsg');
      
      btn.disabled = true;
      btn.textContent = 'Logging in...';
      window.location.href = '/admin/dashboard.html';
      errorEl.style.display = 'none';
      successEl.style.display = 'none';
      
      try {
        const email = this.email.value.trim();
        const password = this.password.value;
        
        const response = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success && result.redirect) {
          successEl.style.display = 'block';
          setTimeout(() => {
         window.location.href = '/admin/dashboard.html';
          }, 500);
        } else {
          errorEl.textContent = result.message || 'Invalid credentials';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Is server running?';
        errorEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Login to Admin Panel';
      }
    });