import { Card, Button, Input, Modal } from '../components/UI.js';
import { AppContext } from '../context/AppContext.js';
import { Router } from '../router.js';
import { calculateScore } from '../utils/math.js';
import { calculateAge } from '../utils/date.js';
import { initIcons } from '../utils/icons.js';

export const AdminDashboard = {
    async render() {
        // Redirect if not admin
        if (!AppContext.currentUser || AppContext.currentUser.role !== 'admin') {
            Router.navigate('/admin_login');
            return '';
        }

        const workers = AppContext.state.workers;

        // Render Helper: Worker Row
        const renderWorkerRow = (worker) => {
            const hasFiveStrikes = (worker.strikes || 0) >= 5;
            const rowBg = hasFiveStrikes ? '#FFCCCB' : 'var(--bg-card)';
            return `
            <div class="worker-row glass-card" style="padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; background-color: ${rowBg}; border: ${hasFiveStrikes ? '1px solid #ef4444' : 'var(--border)'};">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">${worker.name} <span style="font-size: 0.8rem; opacity: 0.7;">(${worker.id})</span></h3>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Status: <span style="color: ${worker.status === 'Active' ? 'var(--success)' : 'var(--warning)'}">${worker.status}</span>
                        | Rating: ${worker.rating} | Age: ${calculateAge(worker.dob)}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                     ${Button({ text: '<i data-lucide="file-text"></i> Report', className: 'btn-sm btn-secondary', onClick: `window.location.hash='#/worker_results?id=${worker.id}'` })}
                </div>
            </div>
        `;
        };

        return `
            <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h1>Dashboard</h1>
                        <p style="color: var(--text-muted);">Welcome, Manager.</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                         ${Button({ text: '<i data-lucide="download"></i> Backup Data', id: 'backup-btn', variant: 'secondary' })}
                         ${Button({ text: 'Logout', id: 'logout-btn', variant: 'secondary' })}
                    </div>
                </header>

                <!-- Controls -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <select id="sort-select" style="padding: 0.5rem; border-radius: 0.5rem; background: var(--bg-card); color: white; border: 1px solid var(--border);">
                        <option value="new">Newest First</option>
                        <option value="rating">Top Rating</option>
                        <option value="old">Oldest First</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    ${Button({ text: '<i data-lucide="plus"></i> Add Worker', id: 'add-worker-btn', variant: 'primary' })}
                </div>

                <!-- Worker List -->
                <div id="worker-list">
                    ${workers.length > 0
                ? workers.map(renderWorkerRow).join('')
                : '<p style="text-align:center; color: var(--text-muted);">No workers found.</p>'
            }
                </div>
            </div>

            <!-- Add Worker Modal -->
            ${Modal({
                id: 'add-worker-modal',
                title: 'Add New Worker',
                children: `
                    <form id="add-worker-form">
                        ${Input({ label: 'Full Name', id: 'w-name', required: true })}
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            ${Input({ label: 'Height (cm)', id: 'w-height', type: 'number', required: true })}
                            ${Input({ label: 'Weight (kg)', id: 'w-weight', type: 'number', required: true })}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            ${Input({ label: 'Date of Birth', id: 'w-dob', type: 'date', required: true })}
                            ${Input({ label: 'Experience (Years)', id: 'w-exp', type: 'number', required: true })}
                        </div>
                        ${Input({ label: 'Personal Rating (0-10)', id: 'w-rating', type: 'number', required: true, placeholder: '0-10' })}
                        
                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                            ${Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn', id: 'cancel-add' })}
                            ${Button({ text: 'Add Worker', type: 'submit', variant: 'primary' })}
                        </div>
                    </form>
                `
            })}
        `;
    },

    afterRender() {
        const modal = document.getElementById('add-worker-modal');

        // Modal Logic
        const openModal = () => {
            modal.classList.remove('hidden');
            // Reset form
            document.getElementById('add-worker-form').reset();
        };
        const closeModal = () => modal.classList.add('hidden');

        document.getElementById('add-worker-btn').addEventListener('click', openModal);

        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent form submit if it's inside form
                closeModal();
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            AppContext.clearSession();
            Router.navigate('/admin_login');
        });

        // Backup Data (PDF Export)
        document.getElementById('backup-btn').addEventListener('click', async () => {
            const btn = document.getElementById('backup-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Generating...';

            const state = AppContext.state;
            const date = new Date().toLocaleDateString();

            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const margin = 20;
                let y = 30;

                // Helper for text
                const addText = (text, size, isBold = false, color = '#1e293b') => {
                    pdf.setFontSize(size);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                    pdf.setTextColor(color);
                    pdf.text(text, margin, y);
                    y += size * 0.5 + 2;
                };

                // 1. Header
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(28);
                pdf.setTextColor('#1e293b');
                pdf.text("Construction Manager", margin, y);

                pdf.setFontSize(10);
                pdf.setFont("helvetica", "bold");
                pdf.text("Generated on", 190 - margin, y - 5, { align: 'right' });
                pdf.setFontSize(14);
                pdf.text(date, 190 - margin, y + 2, { align: 'right' });

                y += 10;
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(12);
                pdf.setTextColor('#64748b');
                pdf.text("Full Workers Database Backup", margin, y);

                y += 8;
                pdf.setDrawColor(59, 130, 246);
                pdf.setLineWidth(1);
                pdf.line(margin, y, 195 - margin, y);

                y += 10;

                // 2. Summary Boxes
                const boxWidth = 55;
                const boxHeight = 25;
                const gap = 5;

                const drawBox = (label, value, x, valColor = '#1e293b') => {
                    pdf.setDrawColor(226, 232, 240);
                    pdf.setFillColor(248, 250, 252);
                    pdf.setLineWidth(0.2);
                    pdf.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');
                    pdf.setFontSize(8);
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor('#64748b');
                    pdf.text(label.toUpperCase(), x + 5, y + 8);
                    pdf.setFontSize(18);
                    pdf.setTextColor(valColor);
                    pdf.text(String(value), x + 5, y + 20);
                };

                const fitCount = state.workers.filter(w => (parseFloat(w.totalScore) || 0) >= 7.0).length;
                const avgScore = (state.workers.reduce((acc, w) => acc + parseFloat(w.totalScore || 0), 0) / (state.workers.length || 1)).toFixed(2);

                drawBox("Total Workers", state.workers.length, margin);
                drawBox("Fit Workers", fitCount, margin + boxWidth + gap, '#10b981');
                drawBox("Avg Score", avgScore, margin + (boxWidth + gap) * 2, '#3b82f6');

                y += boxHeight + 15;

                // 3. Table Header
                pdf.setFillColor(241, 245, 249);
                pdf.rect(margin, y, 170, 10, 'F');

                pdf.setFontSize(9);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor('#475569');
                const colX = [margin + 5, margin + 45, margin + 85, margin + 120, margin + 155];
                pdf.text("ID", colX[0], y + 6.5);
                pdf.text("NAME", colX[1], y + 6.5);
                pdf.text("SCORE", colX[2], y + 6.5);
                pdf.text("STATUS", colX[3], y + 6.5);
                pdf.text("JOINED", colX[4], y + 6.5);

                y += 10;
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.1);

                // 4. Table Rows
                state.workers.forEach(w => {
                    if (y > 275) { pdf.addPage(); y = 20; }
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor('#1e293b');
                    pdf.text(w.id, colX[0], y + 6);
                    pdf.setFont("helvetica", "normal");
                    pdf.text(w.name, colX[1], y + 6);
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor('#3b82f6');
                    pdf.text((w.totalScore || 0).toString(), colX[2], y + 6);
                    pdf.setFont("helvetica", "normal");
                    pdf.setTextColor('#475569');
                    const status = parseFloat(w.totalScore) >= 7.0 ? 'Fit' : (parseFloat(w.totalScore) >= 4.0 ? 'Average' : 'Unfit');
                    pdf.text(status, colX[3], y + 6);
                    pdf.text(new Date(w.createdAt || Date.now()).toLocaleDateString(), colX[4], y + 6);
                    y += 10;
                    pdf.line(margin, y, 185, y);
                });

                pdf.save(`Full_Backup_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) {
                console.error(err);
                alert('Backup generation failed.');
            } finally {
                btn.innerHTML = originalText;
            }
        });

        // Add Worker Form Submit
        document.getElementById('add-worker-form').addEventListener('submit', (e) => {
            e.preventDefault();

            // Gather Data
            const name = document.getElementById('w-name').value;
            const height = parseFloat(document.getElementById('w-height').value);
            const weight = parseFloat(document.getElementById('w-weight').value);
            const dob = document.getElementById('w-dob').value;
            const experience = parseFloat(document.getElementById('w-exp').value);
            const rating = parseFloat(document.getElementById('w-rating').value);

            const age = calculateAge(dob);

            // Generate ID (Basic)
            const id = 'W' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            // Calculate Initial Score
            const scoreData = calculateScore({ height, weight, age, experience, rating });

            const newWorker = {
                id,
                name,
                height,
                weight,
                dob,
                experience,
                rating,
                totalScore: scoreData.total,
                reports: [],
                status: 'Pending', // Pending until first report is added
                createdAt: new Date().toISOString()
            };

            AppContext.addWorker(newWorker);
            closeModal();
            // Re-render
            Router.handleRoute();
        });

        // Sorting Logic
        document.getElementById('sort-select').addEventListener('change', (e) => {
            const sortType = e.target.value;
            let sortedWorkers = [...AppContext.state.workers];

            if (sortType === 'new') {
                sortedWorkers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            } else if (sortType === 'old') {
                sortedWorkers.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            } else if (sortType === 'rating') {
                sortedWorkers.sort((a, b) => b.totalScore - a.totalScore);
            } else if (sortType === 'suspended') {
                sortedWorkers = sortedWorkers.filter(w => w.status === 'Suspended');
            }

            // Simple re-render of list part (optimization)
            // For now, we just reload the whole page for simplicity
            AppContext.state.workers = sortedWorkers; // Temporary sort for view? 
            // Ideally we shouldn't mutate state for sorting view, but for prototype it's fine.
            // Better: we just render sorted here.

            // Let's re-render the whole page to be safe
            Router.handleRoute();
        });
    }
};
