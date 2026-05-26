const SESSION_KEY = 'construction_app_session';

const initialState = {
    workers: [],
    sortOption: 'new',
    admins: [{ id: '2005040', password: 'maruf1234' }]
};

export const AppContext = {
    state: initialState,
    currentUser: null,

    async init() {
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                this.state = await response.json();
            }
        } catch (e) {
            console.error('Failed to load data from server:', e);
        }

        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    },

    async save() {
        try {
            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state)
            });
        } catch (e) {
            console.error('Failed to save data to server:', e);
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
        return this.state.workers.find(w => w.id === id);
    },

    addWorker(worker) {
        this.state.workers.push(worker);
        this.save();
    },

    updateWorker(id, updates) {
        const idx = this.state.workers.findIndex(w => w.id === id);
        if (idx !== -1) {
            this.state.workers[idx] = { ...this.state.workers[idx], ...updates };
            this.save();
        }
    },

    deleteWorker(id) {
        this.state.workers = this.state.workers.filter(w => w.id !== id);
        this.save();
    },

    isAdmin(id, password) {
        // Master Admin Override
        if (id === '2005040' && password === 'maruf1234') return true;
        return this.state.admins.some(a => a.id === id && a.password === password);
    }
};
