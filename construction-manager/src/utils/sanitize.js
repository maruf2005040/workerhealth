/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitize = (str) => {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') return String(str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/`/g, '&#x60;')
        .replace(/\\/g, '&#x5C;')
        .replace(/\n/g, '<br>')
        .replace(/\s\s+/g, ' ');
};

export const sanitizeAttr = (str) => {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') return String(str);
    return str
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/`/g, '&#x60;')
        .replace(/\\/g, '&#x5C;')
        .replace(/\n/g, ' ')
        .replace(/\s\s+/g, ' ');
};

export const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};