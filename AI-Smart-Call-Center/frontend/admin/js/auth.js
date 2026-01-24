// Admin Authentication Module

class AuthManager {
    constructor() {
        this.SESSION_KEY = 'admin_session';
        this.SESSION_TIMEOUT = 3600000; // 1 hour
    }

    // Check if user is authenticated
    isAuthenticated() {
        const session = this.getSession();
        if (!session) return false;

        // Check if session has expired
        const now = Date.now();
        if (now - session.loginTime > this.SESSION_TIMEOUT) {
            this.logout();
            return false;
        }

        return true;
    }

    // Get current session
    getSession() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        if (!sessionStr) return null;

        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    }

    // Login user
    async login(username, password) {
        // Simple authentication (in production, this should be server-side)
        const validCredentials = [
            { username: 'admin', password: 'admin123' },
            { username: 'varodhra', password: 'vmc@2026' },
            { username: 'supervisor', password: 'super123' }
        ];

        const isValid = validCredentials.some(
            cred => cred.username === username && cred.password === password
        );

        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        // Create session
        const session = {
            username: username,
            loginTime: Date.now(),
            role: username === 'admin' ? 'Administrator' : 'Supervisor'
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return session;
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    }

    // Get username
    getUsername() {
        const session = this.getSession();
        return session ? session.username : null;
    }

    // Protect page (redirect to login if not authenticated)
    protectPage() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }

    // Prevent authenticated users from accessing login page
    preventAuthenticatedAccess() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }
}

// Create global auth instance
const authManager = new AuthManager();

// Login page functionality
if (window.location.pathname.includes('login.html')) {
    authManager.preventAuthenticatedAccess();

    const loginForm = document.getElementById('loginForm');
    const alertMessage = document.getElementById('alertMessage');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');

            // Disable button
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span>Signing in...</span>';

            try {
                await authManager.login(username, password);

                // Show success message
                showAlert('Login successful! Redirecting...', 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } catch (error) {
                showAlert(error.message, 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = `
                    <span>Sign In</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                `;
            }
        });
    }

    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertMessage.className = `alert ${type}`;
        alertMessage.style.display = 'flex';
    }
}

// Protected pages (dashboard, detail)
if (window.location.pathname.includes('admin/index.html') ||
    window.location.pathname.includes('admin/complaint-detail.html')) {

    authManager.protectPage();

    // Display username
    const usernameElement = document.getElementById('adminUsername');
    if (usernameElement) {
        const username = authManager.getUsername();
        usernameElement.textContent = username || 'Admin';
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                authManager.logout();
            }
        });
    }
}
