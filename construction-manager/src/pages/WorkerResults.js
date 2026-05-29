import { Card, Button, Input, Badge } from '../components/UI.js';
import { Modal, showModal, hideModal } from '../components/Modal.js';
import { AppContext } from '../context/AppContext.js';
import { Router } from '../router.js';
import { calculateAge } from '../utils/date.js';
import { calculateScore } from '../utils/math.js';

export const WorkerResults = {
    async render() {
        let workerId = Router.getQueryParam('id');
        if (!workerId && AppContext.currentUser?.id) {
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

        const isAdminView = AppContext.currentUser?.role === 'admin';

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
        const age = calculateAge(worker.dob || worker.age);

        return `
            <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                <div style="margin-bottom: 1rem;">
                    ${Button({ 
                        text: '← Back', 
                        variant: 'secondary', 
                        onClick: isAdminView ? "Router.navigate('/admin_page')" : "Router.navigate('/')"
                    })}
                </div>

                <div id="print-area">
                    <header style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${worker.name}</h1>
                                <p style="color: var(--text-muted);">Worker ID: ${worker.id}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1;">
                                    ${worker.totalScore || calculateScore({ height: worker.height, weight: worker.weight, age, experience: worker.experience, rating: worker.rating }).total}
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">Total Score</div>
                            </div>
                        </div>
                    </header>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        ${Card({
                            title: 'Profile Details',
                            children: `
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.95rem;">
                                    <div><strong>Age:</strong> ${age || worker.age || 'N/A'}</div>
                                    <div><strong>Experience:</strong> ${worker.experience || 0} Years</div>
                                    <div><strong>Height:</strong> ${worker.height || 'N/A'} cm</div>
                                    <div><strong>Weight:</strong> ${worker.weight || 'N/A'} kg</div>
                                    <div><strong>Status:</strong> ${Badge({ text: worker.status || 'Pending', variant: (worker.status || 'pending').toLowerCase() })}</div>
                                    <div><strong>Rating:</strong> ${worker.rating || 0}/10</div>
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

                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h2 style="font-size: 1.5rem;">Reports History</h2>
                            ${isAdminView ? Button({ text: '+ New Report', id: 'new-report-btn', variant: 'primary' }) : ''}
                        </div>
                        <div class="glass-card" style="padding: 1rem;">
                            ${worker.reports && worker.reports.length > 0 ? worker.reports.map(r => `
                                <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <strong>${r.date}</strong>
                                        <span style="font-size: 0.8rem; opacity: 0.7;">${r.author}</span>
                                    </div>
                                    <p>${r.content}</p>
                                </div>
                            `).join('') : '<p style="color: var(--text-muted); font-style: italic;">No reports found.</p>'}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem; display: flex; justify-content: center;">
                    ${Button({ text: '📥 Download PDF', id: 'pdf-btn', variant: 'secondary' })}
                </div>

                ${isAdminView ? Modal({
                    id: 'report-modal',
                    title: 'Create New Report',
                    children: `
                        <form id="report-form">
                            <div class="input-group">
                                <label>Report Content</label>
                                <textarea id="report-content" rows="5" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 0.5rem; color: var(--text-main);"></textarea>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                                ${Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn' })}
                                ${Button({ text: 'Submit Report', type: 'submit', variant: 'primary' })}
                            </div>
                        </form>
                    `
                }) : ''}
            </div>
        `;
    },

    afterRender() {
        const isAdminView = AppContext.currentUser?.role === 'admin';

        if (isAdminView) {
            const modal = document.getElementById('report-modal-overlay');
            document.getElementById('new-report-btn')?.addEventListener('click', () => {
                showModal('report-modal');
            });

            document.querySelectorAll('.close-modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    hideModal('report-modal');
                });
            });

            document.getElementById('report-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const content = document.getElementById('report-content').value;
                let workerId = Router.getQueryParam('id');
                if (!workerId && AppContext.currentUser) {
                    workerId = AppContext.currentUser.id;
                }

                if (workerId) {
                    const report = {
                        date: new Date().toLocaleDateString(),
                        content: content,
                        author: AppContext.currentUser?.role === 'admin' ? 'Manager' : 'Worker'
                    };
                    const worker = AppContext.getWorker(workerId);
                    const updates = {
                        reports: [report, ...(worker.reports || [])],
                        status: 'Active'
                    };
                    AppContext.updateWorker(workerId, updates);
                    hideModal('report-modal');
                    Router.navigate('/worker_results?id=' + workerId);
                }
            });
        }

        document.getElementById('pdf-btn')?.addEventListener('click', async () => {
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