document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('loginBtn');
  const errorEl = document.getElementById('errorMsg');
  const successEl = document.getElementById('successMsg');
  
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  errorEl.style.display = 'none';
  successEl.style.display = 'none';
  
  try {
    const email = this.email.value.trim();
    const password = this.password.value;
    
    // ✅ FIXED: Use '/api/login' instead of '/api/admin-login'
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success && result.redirect) {
      successEl.textContent = '✅ Success! Redirecting...';
      successEl.style.display = 'block';
      setTimeout(() => {
        // ✅ This will redirect to '/admin', which loads the dashboard
        window.location.href = result.redirect; 
      }, 600);
    } else {
      errorEl.textContent = result.message || 'Invalid credentials';
      errorEl.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = 'Network error. Is server running?';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});