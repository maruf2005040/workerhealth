export const Button = ({ text, onClick, variant = 'primary', type = 'button', className = '', id = '' }) => {
    return `
        <button 
            type="${type}" 
            class="btn btn-${variant} ${className}"
            ${id ? `id="${id}"` : ''}
            ${onClick ? `onclick="${onClick}"` : ''}
        >
            ${text}
        </button>
    `;
};

export const Input = ({ label, type = 'text', id, placeholder = '', required = false, value = '' }) => {
    return `
        <div class="input-group">
            <label for="${id}">${label}</label>
            <input 
                type="${type}" 
                id="${id}" 
                placeholder="${placeholder}"
                ${required ? 'required' : ''}
                value="${value}"
            >
        </div>
    `;
};

export const Card = ({ title, children, className = '' }) => {
    return `
        <div class="glass-card ${className}">
            ${title ? `<h2 class="card-title">${title}</h2>` : ''}
            <div class="card-content">
                ${children}
            </div>
        </div>
    `;
};
