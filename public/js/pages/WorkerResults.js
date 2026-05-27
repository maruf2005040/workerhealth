import { Card, Button, Input, Modal } from '../components/UI.js';
import { AppContext } from '../context/AppContext.js';
import { Router } from '../router.js';
import { calculateAge } from '../utils/date.js';

export const WorkerResults = {
    async render() {
        let workerId = null;
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            const params = new URLSearchParams(hashParts[1]);
            workerId = params.get('id');
        }

        if (!workerId && AppContext.currentUser && AppContext.currentUser.id) {
            workerId = AppContext.currentUser.id;
        }

        if (!workerId) {
            Router.navigate('/');
            return '';
        }

        const worker = AppContext.getWorker(workerId);
        if (!worker) {
            alert('Worker not found');
            Router.navigate('/');
            return '';
        }

        const isAdminView = AppContext.currentUser && AppContext.currentUser.role === 'admin';

        const getRoutine = (w) => {
            const bmi = w.weight / ((w.height / 100) ** 2);
            if (bmi > 25) {
                return {
                    exercise: 'Cardio Focus: 30 mins running, 15 mins cycling daily.',
                    food: 'Low Carb: Increase vegetables, lean protein (chicken/fish).'
                };
            }
            return {
                exercise: 'Strength Focus: Weight lifting, 3x per week.',
                food: 'High Protein: Red meat, eggs, complex carbs.'
            };
        };

        const routine = getRoutine(worker);

        return `
            <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                <div style="margin-bottom: 1rem;">
                    ${Button({ text: 'Back', variant: 'secondary', onClick: isAdminView ? "window.location.hash='#/admin_page'" : "window.location.hash='#/'" })}
                </div>

                <div id="print-area">
                    <header style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${worker.name}</h1>
                                <p style="color: var(--text-muted);">Worker ID: ${worker.id}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1;">${worker.totalScore || 0}</div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">Total Score</div>
                            </div>
                        </div>
                    </header>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        ${Card({
            title: 'Profile Details',
            children: `
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.95rem;">
                                    <div><strong>Age:</strong> ${calculateAge(worker.dob)}</div>
                                    <div><strong>Experience:</strong> ${worker.experience} Years</div>
                                    <div><strong>Height:</strong> ${worker.height} cm</div>
                                    <div><strong>Weight:</strong> ${worker.weight} kg</div>
                                    <div><strong>Status:</strong> ${worker.status}</div>
                                    <div><strong>Rating:</strong> ${worker.rating}/10</div>
                                </div>
                            `
        })}

                        ${Card({
            title: 'Recommended Routine',
            children: `
                                <div style="margin-bottom: 1rem;">
                                    <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Exercise Plan</h4>
                                    <p>${routine.exercise}</p>
                                </div>
                                <div>
                                    <h4 style="color: var(--success); margin-bottom: 0.5rem;">Dietary Plan</h4>
                                    <p>${routine.food}</p>
                                </div>
                            `
        })}
                    </div>

                    <!-- Reports Section -->
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h2 style="font-size: 1.5rem;">Reports History</h2>
                            ${Button({ text: '+ New Report', id: 'new-report-btn', variant: 'primary' })}
                        </div>

                        <div class="glass-card" style="padding: 1rem;">
                            ${worker.reports && worker.reports.length > 0
                ? worker.reports.map(r => `
                                    <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                            <strong>${r.date}</strong>
                                            <span style="font-size: 0.8rem; opacity: 0.7;">${r.author || ''}</span>
                                        </div>
                                        <p>${r.content}</p>
                                    </div>
                                `).join('')
                : '<p style="color: var(--text-muted); font-style: italic;">No reports found.</p>'
            }
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem; display: flex; justify-content: center;">
                    ${Button({ text: '<i data-lucide="download"></i> Download PDF', id: 'pdf-btn', variant: 'secondary' })}
                </div>
            </div>

            <!-- Add Report Modal -->
            ${Modal({
                id: 'report-modal',
                title: 'Create New Report',
                children: `
                    <form id="report-form">
                        <div class="input-group">
                            <label>Report Content</label>
                            <textarea id="report-content" rows="5" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 0.5rem; color: white;"></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                             ${Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn' })}
                             ${Button({ text: 'Submit Report', type: 'submit', variant: 'primary' })}
                        </div>
                    </form>
                `
            })}
        `;
    },

    afterRender() {
        const modal = document.getElementById('report-modal');
        document.getElementById('new-report-btn').addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('hidden');
            });
        });

        // Submit Report
        document.getElementById('report-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('report-content').value.trim();
            if (!content) return;

            let workerId = null;
            const hashParts = window.location.hash.split('?');
            if (hashParts.length > 1) {
                workerId = new URLSearchParams(hashParts[1]).get('id');
            } else if (AppContext.currentUser) {
                workerId = AppContext.currentUser.id;
            }

            if (workerId) {
                const report = {
                    date: new Date().toLocaleDateString(),
                    content: content,
                    author: AppContext.currentUser ? (AppContext.currentUser.role === 'admin' ? 'Manager' : 'Worker') : 'Unknown',
                    messages: []
                };

                const worker = AppContext.getWorker(workerId);
                const updates = {
                    reports: [report, ...(worker.reports || [])],
                    status: 'Active'
                };

                const saved = await AppContext.updateWorker(workerId, updates);
                if (saved) {
                    modal.classList.add('hidden');
                    Router.handleRoute();
                } else {
                    alert('Failed to save report. Please try again.');
                }
            }
        });

        // PDF Export
        document.getElementById('pdf-btn').addEventListener('click', async () => {
            const btn = document.getElementById('pdf-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Generating...';

            try {
                const element = document.getElementById('print-area');
                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const margin = 25.4;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const contentWidth = pdfWidth - (2 * margin);
                const contentHeight = (canvas.height * contentWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                pdf.save(`Worker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) {
                console.error(err);
                alert('PDF generation failed.');
            } finally {
                btn.innerHTML = originalText;
            }
        });
    }
};
