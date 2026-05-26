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
        // Handle Login
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('admin-id').value.trim();
            const password = document.getElementById('admin-password').value.trim();

            if (AppContext.isAdmin(id, password)) {
                // Set mock admin session
                AppContext.setSession({ id: 'admin', role: 'admin' });
                Router.navigate('/admin_page');
            } else {
                alert('Invalid Credentials! (Try: admin / admin)');
            }
        });

        // Handle Back Navigation
        document.getElementById('back-btn').addEventListener('click', () => {
            Router.navigate('/');
        });
    }
};
