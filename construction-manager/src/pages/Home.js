import { Card, Button, Input } from '../components/UI.js';
import { Router } from '../router.js';
import { AppContext } from '../context/AppContext.js';

export const Home = {
    async render() {
        return `
            <div class="container flex-center" style="min-height: 100vh;">
                <div style="max-width: 480px; width: 100%;">
                    <div class="text-center" style="margin-bottom: 2rem; text-align: center;">
                        <h1 class="text-gradient" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">
                            Construction<br>Manager
                        </h1>
                        <p style="color: var(--text-muted);">Building Futures, Not Just Structures</p>
                    </div>
                    ${Card({
                        title: 'Worker Portal',
                        children: `
                            <form id="worker-login-form">
                                ${Input({ label: 'Enter Worker ID', id: 'worker-id', placeholder: 'e.g., W001', required: true })}
                                ${Button({ text: 'Access Dashboard', type: 'submit', variant: 'primary', className: 'btn-block' })}
                            </form>
                            <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                                <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted);">Are you a manager?</p>
                                ${Button({ text: 'Admin Login', variant: 'secondary', className: 'btn-block', id: 'admin-btn' })}
                            </div>
                        `
                    })}
                </div>
            </div>
        `;
    },

    afterRender() {
        document.getElementById('worker-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const workerId = document.getElementById('worker-id').value.trim();
            const worker = AppContext.getWorker(workerId);
            if (worker) {
                AppContext.setSession(worker);
                Router.navigate('/worker_results');
            } else {
                alert('Invalid Worker ID. Please try again.');
            }
        });

        document.getElementById('admin-btn').addEventListener('click', () => {
            Router.navigate('/admin_login');
        });
    }
};