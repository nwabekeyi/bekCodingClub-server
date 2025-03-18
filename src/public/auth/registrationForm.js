function generateFormFields() {
    const form = document.getElementById('register-form');
    const title = document.getElementById('form-title');
    const pathname = window.location.pathname.toLowerCase();
    console.log(form);

    if (pathname.includes('passwordreset')) {
        title.textContent = 'Reset Password';
        form.innerHTML = `
            <div class="form-row">
                <input type="password" id="password" placeholder="New Password" required>
                <input type="password" id="confirm-password" placeholder="Confirm Password" required>
            </div>
            <button type="submit" class="register-btn">Reset Password</button>
        `;
    } else if (pathname.includes('signup')) {
        title.textContent = 'Sign Up';
        form.innerHTML = `
            <div class="form-row">
                <input type="text" id="first-name" placeholder="First Name" required>
                <input type="text" id="last-name" placeholder="Last Name" required>
            </div>
            <input type="tel" id="phone" placeholder="Phone Number" required>
            <input type="email" id="email" placeholder="Email" required>
            <div class="form-row">
                <input type="password" id="password" placeholder="Password" required>
                <input type="password" id="confirm-password" placeholder="Confirm Password" required>
            </div>
            <div class="form-row">
                <label>
                    <input type="checkbox" id="terms" required> I've read & agree to the Terms and Conditions
                </label>
            </div>
            <button type="submit" class="register-btn">Register</button>
        `;
    } else if (pathname.includes('forgotpassword')) {
        title.textContent = 'Forgot Password';
        form.innerHTML = `
            <input type="email" id="email" placeholder="Email" required>
            <button type="submit" class="register-btn">Send Reset Link</button>
        `;
    } else {
        console.log(true);
        // Default to signup form
        title.textContent = 'Sign Up';
        form.innerHTML = `
            <div class="form-row">
                <input type="text" id="first-name" placeholder="First Name" required>
                <input type="text" id="last-name" placeholder="Last Name" required>
            </div>
            <input type="tel" id="phone" placeholder="Phone Number" required>
            <input type="email" id="email" placeholder="Email" required>
            <div class="form-row">
                <input type="password" id="password" placeholder="Password" required>
                <input type="password" id="confirm-password" placeholder="Confirm Password" required>
            </div>
            <div class="form-row">
                <label>
                    <input type="checkbox" id="terms" required> I've read & agree to the Terms and Conditions
                </label>
            </div>
            <button type="submit" class="register-btn">Register</button>
        `;
    }
}

function handleRegister(event) {
    event.preventDefault();
    const pathname = window.location.pathname.toLowerCase();
    const form = document.getElementById('register-form');

    const getInputValue = (id) => document.getElementById(id)?.value.trim() || '';
    const getChecked = (id) => document.getElementById(id)?.checked || false;

    if (pathname.includes('passwordreset')) {
        const password = getInputValue('password');
        const confirmPassword = getInputValue('confirm-password');

        if (!password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        // Simulate password reset API call
        console.log('Password reset submitted:', { password });
        alert('Password reset successful');
        form.reset();

    } else if (pathname.includes('signup')) {
        const firstName = getInputValue('first-name');
        const lastName = getInputValue('last-name');
        const phone = getInputValue('phone');
        const email = getInputValue('email');
        const password = getInputValue('password');
        const confirmPassword = getInputValue('confirm-password');
        const terms = getChecked('terms');

        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (!terms) {
            alert('You must agree to the Terms and Conditions');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        // Simulate signup API call
        fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, phone, email, password })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Registration successful');
                form.reset();
                window.location.href = '.../studentDashBoard.html';
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        });

    } else if (pathname.includes('forgotpassword')) {
        const email = getInputValue('email');

        if (!email) {
            alert('Email is required');
            return;
        }

        // Simulate forgot password API call
        console.log('Forgot password submitted:', { email });
        alert('Reset link sent to your email');
        form.reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateFormFields();
    
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }

    // Prefill email if present in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = email;
    }

    // Add event listener for have-account-btn
    const accountBtn = document.getElementById('account-btn');
    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            window.location.href = ''; // Add your login page URL here
        });
    }
});