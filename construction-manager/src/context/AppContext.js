const SESSION_KEY = 'construction_app_session';
const API_BASE = '/api';

const initialState = {
    workers: [],
    sortOption: 'new'
};

export const AppContext = {
    state: { ...initialState },
    currentUser: null,

    async init() {
        try {
            const response = await fetch(`${API_BASE}/data`);
            if (response.ok) {
                this.state = await response.json();
            }
        } catch (e) {
            console.error('Failed to load data from server:', e);
            const saved = localStorage.getItem('app_state');
            if (saved) {
                try { this.state = JSON.parse(saved); }
                catch (parseError) { console.error('Failed to parse saved state:', parseError); }
            }
        }

        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            try { this.currentUser = JSON.parse(session); }
            catch (e) { console.error('Failed to parse session:', e); this.clearSession(); }
        }
    },

    async save() {
        try {
            await fetch(`${API_BASE}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state)
            });
            localStorage.setItem('app_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save data to server:', e);
            try { localStorage.setItem('app_state', JSON.stringify(this.state)); }
            catch (storageError) { console.error('Failed to save to localStorage:', storageError); }
        }
    },

    setSession(user) {
        this.currentUser = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },

    clearSession() {
        this.currentUser = null;
        localStorage.removeItem(SESSION_KEY);
    },

    getWorker(id) {
        if (!id) return null;
        return this.state.workers.find(w => w.id === id) || null;
    },

    getAllWorkers() {
        return [...this.state.workers];
    },

    addWorker(worker) {
        if (!worker || !worker.id) {
            console.error('Invalid worker data');
            return;
        }
        const existingIndex = this.state.workers.findIndex(w => w.id === worker.id);
        if (existingIndex !== -1) {
            this.state.workers[existingIndex] = { ...this.state.workers[existingIndex], ...worker };
        } else {
            this.state.workers.push(worker);
        }
        this.save();
    },

    updateWorker(id, updates) {
        if (!id) return;
        const idx = this.state.workers.findIndex(w => w.id === id);
        if (idx !== -1) {
            this.state.workers[idx] = { ...this.state.workers[idx], ...updates };
            this.save();
        }
    },

    deleteWorker(id) {
        if (!id) return;
        this.state.workers = this.state.workers.filter(w => w.id !== id);
        this.save();
    },

    async authenticateAdmin(id, password) {
        if (!id || !password) return false;
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });
            if (response.ok) {
                const data = await response.json();
                return data.success || false;
            }
            return false;
        } catch (e) {
            console.error('Authentication error:', e);
            return false;
        }
    },

    logout() {
        this.clearSession();
        window.location.hash = '/';
        window.location.reload();
    }
};