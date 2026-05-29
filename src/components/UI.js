import { sanitize, sanitizeAttr } from '../utils/sanitize.js';

export const Button = ({ text, onClick, variant = 'primary', type = 'button', className = '', id = '', disabled = false }) => {
    const safeText = sanitize(text);
    const safeOnClick = onClick ? `onclick="${sanitizeAttr(onClick)}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const safeId = id ? `id="${sanitizeAttr(id)}"` : '';
    return `
        <button type="${type}" class="btn btn-${variant} ${className}" ${safeId} ${safeOnClick} ${disabledAttr}>
            ${safeText}
        </button>
    `;
};

export const Input = ({ label, type = 'text', id, placeholder = '', required = false, value = '', name = '' }) => {
    const safeLabel = sanitize(label);
    const safePlaceholder = sanitizeAttr(placeholder);
    const safeValue = sanitizeAttr(value);
    const safeId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const safeName = name || safeId;
    return `
        <div class="input-group">
            ${label ? `<label for="${safeId}">${safeLabel}</label>` : ''}
            <input type="${type}" id="${safeId}" name="${safeName}" placeholder="${safePlaceholder}"
                ${required ? 'required' : ''} value="${safeValue}">
        </div>
    `;
};

export const Card = ({ title, children, className = '' }) => {
    const safeTitle = sanitize(title);
    return `
        <div class="glass-card ${className}">
            ${title ? `<h2 class="card-title">${safeTitle}</h2>` : ''}
            <div class="card-content">${children}</div>
        </div>
    `;
};

export const Badge = ({ text, variant = 'active' }) => {
    const safeText = sanitize(text);
    return `<span class="badge badge-${variant}">${safeText}</span>`;
};

export const Alert = ({ message, variant = 'error' }) => {
    const safeMessage = sanitize(message);
    return `<div class="alert alert-${variant}">${safeMessage}</div>`;
};