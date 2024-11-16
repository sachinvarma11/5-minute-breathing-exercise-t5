// Google Sign-In callback
function handleCredentialResponse(response) {
    // Decode the credential response
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Handle the user info
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Email: ' + responsePayload.email);
    console.log('Picture: ' + responsePayload.picture);

    // Store user info in localStorage or send to your backend
    localStorage.setItem('user', JSON.stringify({
        id: responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    }));

    // Redirect to main app
    window.location.href = 'index.html';
}

// Helper function to decode JWT
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Regular login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Add your login logic here
    console.log('Login attempt:', email);
    
    // Redirect to main app after successful login
    window.location.href = 'index.html';
});

// Show signup modal
document.getElementById('showSignup').addEventListener('click', function() {
    document.getElementById('signupModal').style.display = 'flex';
});

// Close signup modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('signupModal').style.display = 'none';
});

// Signup form handler
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Add your signup logic here
    console.log('Signup attempt:', { name, email });
    
    // Close modal and show success message
    document.getElementById('signupModal').style.display = 'none';
    alert('Account created successfully! Please log in.');
}); 