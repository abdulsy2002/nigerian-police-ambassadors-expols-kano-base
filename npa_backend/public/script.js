function resetPassword(){

const email = document.getElementById("resetEmail").value;
const newPassword = document.getElementById("newPassword").value;

let users = JSON.parse(localStorage.getItem("users")) || [];

let user = users.find(u => u.email === email);

if(user){

    user.password = newPassword;

    localStorage.setItem("users", JSON.stringify(users));

    alert("Password reset successful!");

    window.location.href = "login.html";

}
else{
    alert("Email not found!");
}

}
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form from submitting the normal way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple example: check for hardcoded user
    if(email === "admin@example.com" && password === "password123") {
        // Redirect to dashboard
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid email or password. Try again.");
    }
});
function register(){

let email = document.getElementById("registerEmail").value;
let password = document.getElementById("password").value;

let users = JSON.parse(localStorage.getItem("users")) || [];

let newUser = {
email: email,
password: password
};

users.push(newUser);

localStorage.setItem("users", JSON.stringify(users));

alert("Registration Successful!");

window.location.href = "login.html";

}
// ===== 🔐 AUTH SESSION FUNCTIONS =====

// Check if user has valid auth session before loading form
function requireAuthSession() {
  const session = JSON.parse(localStorage.getItem('authSession'));
  const now = Date.now();
  
  if (!session || !session.code || session.expiresAt < now) {
    localStorage.removeItem('authSession');
    window.location.href = 'index.html'; // Redirect to login
    return false;
  }
  return true;
}

// Clear auth session after successful registration
function clearAuthSession() {
  localStorage.removeItem('authSession');
}
// Auth check endpoint
app.get('/api/check-auth', (req, res) => {
  res.json({ 
    loggedIn: !!req.session.loggedIn, 
    user: req.session.user || null 
  });
});

// Protect index.html
app.get('/index.html', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// Usage in form.html: Add this at top of <body>
/*
<script>
  if (!requireAuthSession()) {
    // Redirect handled by function
  }
</script>
*/

// Usage in form submission handler (after successful save):
/*
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // ... save data to localStorage ...
  
  // ✅ Clear auth session after registration
  clearAuthSession();
  
  // Show success
  document.getElementById('successPopup').style.display = 'flex';
  form.reset();
});
*/
localStorage.removeItem('authSession');