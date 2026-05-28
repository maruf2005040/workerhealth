import { Card, Input, Button } from '../components/UI.js';
import { Router } from '../router.js';
import { AppContext } from '../context/AppContext.js';

export const AdminLogin = {
    async render() {
        return `
            <div class="container flex-center" style="min-height: 100vh;">
                <div style="max-width: 400px; width: 100%;">
                    ${Card({
            title: 'Admin Login',
            children: `
                            <form id="admin-login-form">
                                ${Input({
                label: 'Admin ID',
                id: 'admin-id',
                placeholder: 'Enter Admin ID',
                required: true
            })}
                                ${Input({
                label: 'Password',
                id: 'admin-password',
                type: 'password',
                placeholder: 'Enter Password',
                required: true
            })}
                                <div id="login-error" style="display: none; color: #ef4444; background: #fee2e2; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;"></div>
                                ${Button({
                text: 'Login',
                type: 'submit',
                variant: 'primary',
                className: 'btn-block',
                id: 'login-btn'
            })}
                            </form>
                            <div style="margin-top: 1rem; text-align: center;">
                                ${Button({
                text: 'Back to Home',
                variant: 'secondary',
                className: 'btn-block',
                id: 'back-btn'
            })}
                            </div>
                        `
        })}
                </div>
            </div>
        `;
    },

    afterRender() {
        const loginBtn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        // Handle Login
        document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('admin-id').value.trim();
            const password = document.getElementById('admin-password').value.trim();

            // Show loading state
            loginBtn.disabled = true;
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Authenticating...';
            errorDiv.style.display = 'none';

            try {
                // Authenticate against Turso database
                const isValid = await AppContext.authenticateAdmin(id, password);
                
                if (isValid) {
                    // Set admin session
                    AppContext.setSession({ id: id, role: 'admin' });
                    Router.navigate('/admin_page');
                } else {
                    // Show error
                    errorDiv.textContent = 'Invalid credentials. Please check your Admin ID and password.';
                    errorDiv.style.display = 'block';
                    document.getElementById('admin-password').value = '';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Login failed. Please try again.';
                errorDiv.style.display = 'block';
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
            }
        });

        // Handle Back Navigation
        document.getElementById('back-btn').addEventListener('click', () => {
            Router.navigate('/');
        });
    }
};
