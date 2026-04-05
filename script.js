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