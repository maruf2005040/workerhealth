import { sanitize, sanitizeAttr } from '../utils/sanitize.js';

export const Modal = ({ id, title, children, className = '' }) => {
    const safeId = sanitizeAttr(id);
    const safeTitle = sanitize(title);
    return `
        <div id="${safeId}-overlay" class="modal-overlay hidden">
            <div class="modal-content ${className}">
                <div class="modal-header">
                    <h2 class="card-title" style="margin: 0;">${safeTitle}</h2>
                    <button class="close-modal-btn" data-close-modal="${safeId}">×</button>
                </div>
                <div class="modal-body">${children}</div>
            </div>
        </div>
    `;
};

export const showModal = (modalId) => {
    const overlay = document.getElementById(`${modalId}-overlay`);
    if (overlay) overlay.classList.remove('hidden');
};

export const hideModal = (modalId) => {
    const overlay = document.getElementById(`${modalId}-overlay`);
    if (overlay) overlay.classList.add('hidden');
};

export const setupModalListeners = () => {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-close-modal');
            hideModal(modalId);
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });
};