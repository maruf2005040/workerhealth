import { Card, Button, Input, Badge, Alert } from '../components/UI.js';
import { Modal, showModal, hideModal } from '../components/Modal.js';
import { Router } from '../router.js';
import { AppContext } from '../context/AppContext.js';
import { calculateScore } from '../utils/math.js';

export const AdminDashboard = {
    async render() {
        const workers = AppContext.getAllWorkers();
        const sortOption = AppContext.state.sortOption || 'new';

        // Sort workers
        const sortedWorkers = [...workers].sort((a, b) => {
            if (sortOption === 'score') return (b.totalScore || 0) - (a.totalScore || 0);
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'status') return a.status.localeCompare(b.status);
            return new Date(b.createdAt || b.dob) - new Date(a.createdAt || a.dob); // new
        });

        return `
            <div class="container" style="padding-top: 1rem; padding-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h1 style="font-size: 1.75rem; font-weight: 700;">Admin Dashboard</h1>
                        <p style="color: var(--text-muted);">Manage workers and view analytics</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${Button({ text: 'Logout', variant: 'secondary', onClick: 'AppContext.logout()' })}
                    </div>
                </div>

                ${Alert({ message: `Showing ${sortedWorkers.length} workers`, variant: 'success' })}

                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    ${Button({ text: '+ Add Worker', variant: 'primary', id: 'add-worker-btn' })}
                    <select id="sort-select" style="padding: 0.5rem 1rem; border-radius: 0.5rem; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-main);">
                        <option value="new" ${sortOption === 'new' ? 'selected' : ''}>Newest First</option>
                        <option value="score" ${sortOption === 'score' ? 'selected' : ''}>Highest Score</option>
                        <option value="name" ${sortOption === 'name' ? 'selected' : ''}>Name (A-Z)</option>
                        <option value="status" ${sortOption === 'status' ? 'selected' : ''}>Status</option>
                    </select>
                    ${Button({ text: '📥 Export PDF', variant: 'secondary', id: 'export-pdf-btn' })}
                </div>

                <div class="glass-card">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Experience</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedWorkers.length > 0 ? sortedWorkers.map(worker => `
                                    <tr>
                                        <td>${worker.id}</td>
                                        <td><strong>${worker.name}</strong></td>
                                        <td>${worker.totalScore || 'N/A'}</td>
                                        <td>${Badge({ text: worker.status || 'Pending', variant: worker.status?.toLowerCase() || 'pending' })}</td>
                                        <td>${worker.experience || 0} years</td>
                                        <td class="table-actions">
                                            ${Button({ text: 'View', variant: 'secondary', onClick: `Router.navigate('/worker_results?id=${worker.id}')`, className: 'btn-sm' })}
                                            ${Button({ text: 'Delete', variant: 'danger', onClick: `confirm('Delete ${worker.name}?') && AppContext.deleteWorker('${worker.id}')`, className: 'btn-sm' })}
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: var(--text-muted);">No workers found</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>

                ${Modal({
                    id: 'add-worker-modal',
                    title: 'Add New Worker',
                    children: `
                        <form id="add-worker-form">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                ${Input({ label: 'Worker ID', id: 'new-worker-id', placeholder: 'W001', required: true })}
                                ${Input({ label: 'Name', id: 'new-worker-name', placeholder: 'John Doe', required: true })}
                                ${Input({ label: 'Height (cm)', id: 'new-worker-height', type: 'number', placeholder: '175', required: true })}
                                ${Input({ label: 'Weight (kg)', id: 'new-worker-weight', type: 'number', placeholder: '70', required: true })}
                                ${Input({ label: 'Age', id: 'new-worker-age', type: 'number', placeholder: '30', required: true })}
                                ${Input({ label: 'Experience (years)', id: 'new-worker-exp', type: 'number', placeholder: '5', required: true })}
                                ${Input({ label: 'Rating (1-10)', id: 'new-worker-rating', type: 'number', min: 1, max: 10, placeholder: '8', required: true })}
                                <div></div>
                                <div>
                                    <select id="new-worker-status" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-main);">
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                ${Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn', id: 'cancel-add-worker' })}
                                ${Button({ text: 'Add Worker', type: 'submit', variant: 'primary', id: 'submit-add-worker' })}
                            </div>
                        </form>
                    `
                })}
            </div>
        `;
    },

    afterRender() {
        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            AppContext.state.sortOption = e.target.value;
            AppContext.save();
            this.render().then(html => {
                document.getElementById('app').innerHTML = html;
                this.afterRender();
            });
        });

        // Add worker modal
        document.getElementById('add-worker-btn').addEventListener('click', () => {
            showModal('add-worker-modal');
        });

        document.getElementById('cancel-add-worker').addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('add-worker-modal');
        });

        document.getElementById('add-worker-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('new-worker-id').value.trim();
            const name = document.getElementById('new-worker-name').value.trim();
            const height = parseFloat(document.getElementById('new-worker-height').value);
            const weight = parseFloat(document.getElementById('new-worker-weight').value);
            const age = parseInt(document.getElementById('new-worker-age').value);
            const experience = parseFloat(document.getElementById('new-worker-exp').value);
            const rating = parseFloat(document.getElementById('new-worker-rating').value);
            const status = document.getElementById('new-worker-status').value;

            if (!id || !name || isNaN(height) || isNaN(weight) || isNaN(age) || isNaN(experience) || isNaN(rating)) {
                alert('Please fill all fields with valid values');
                return;
            }

            const score = calculateScore({ height, weight, age, experience, rating });
            const worker = { id, name, height, weight, age, experience, rating, status, totalScore: score.total, reports: [], createdAt: new Date().toISOString() };
            AppContext.addWorker(worker);
            hideModal('add-worker-modal');
            document.getElementById('add-worker-form').reset();
            Router.navigate('/admin_page');
        });

        // PDF Export
        document.getElementById('export-pdf-btn').addEventListener('click', async () => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const workers = AppContext.getAllWorkers();
                
                pdf.text('Construction Manager - Worker List', 105, 15, { align: 'center' });
                pdf.text(`Total Workers: ${workers.length}`, 105, 25, { align: 'center' });
                
                let y = 35;
                workers.forEach((worker, index) => {
                    if (y > 280) { pdf.addPage(); y = 20; }
                    pdf.text(`${index + 1}. ${worker.name} (ID: ${worker.id}) - Score: ${worker.totalScore || 'N/A'}`, 15, y);
                    y += 7;
                });
                
                pdf.save(`Workers_List_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) {
                console.error('PDF export failed:', err);
                alert('PDF export failed. Please try again.');
            }
        });
    }
};