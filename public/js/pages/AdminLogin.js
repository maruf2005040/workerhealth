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
                                ${Button({
                text: 'Login',
                type: 'submit',
                variant: 'primary',
                className: 'btn-block'
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
        // Handle Login - validates server-side via /api/auth
        document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const loginBtn = e.target.querySelector('button[type="submit"]');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = 'Logging in...';
            loginBtn.disabled = true;

            const id = document.getElementById('admin-id').value.trim();
            const password = document.getElementById('admin-password').value.trim();

            // Server-side validation via /api/auth
            const result = await AppContext.loginAdmin(id, password);

            if (result.success) {
                Router.navigate('/admin_page');
            } else {
                alert(result.error || 'Invalid Credentials!');
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });

        // Handle Back Navigation
        document.getElementById('back-btn').addEventListener('click', () => {
            Router.navigate('/');
        });
    }
};
