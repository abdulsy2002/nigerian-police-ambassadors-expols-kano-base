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