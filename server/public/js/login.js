async function login() {
    const responseDiv = document.getElementById('response');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        console.log('Login attempt with:', { email });
        const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('Login successful');
            responseDiv.className = 'success';
            responseDiv.textContent = 'Login successful!\n\nResponse:\n' + JSON.stringify(data, null, 2);
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            console.log('Token stored in localStorage');
        } else {
            console.log('Login failed:', data.message);
            responseDiv.className = 'error';
            responseDiv.textContent = 'Login failed: ' + data.message;
        }
    } catch (error) {
        console.error('Login error:', error);
        responseDiv.className = 'error';
        responseDiv.textContent = 'Error: ' + error.message;
    }
}
