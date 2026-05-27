const SESSION_KEY = 'construction_app_session';

// NO hardcoded admin credentials here!
// Admin login is validated server-side via /api/auth
const initialState = {
    workers: [],
    sortOption: 'new'
};

export const AppContext = {
    state: initialState,
    currentUser: null,

    async init() {
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                const data = await response.json();
                // Remove any leaked admins array from old data
                if (data.admins) {
                    delete data.admins;
                }
                this.state = data;
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
            // Clean state before saving (remove admins if somehow present)
            const stateToSave = { ...this.state };
            if (stateToSave.admins) {
                delete stateToSave.admins;
            }

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateToSave)
            });

            if (!response.ok) {
                console.error('Save failed with status:', response.status);
            }
            return response.ok;
        } catch (e) {
            console.error('Failed to save data to server:', e);
            return false;
        }
    },

    /**
     * Server-side admin login via /api/auth
     * Credentials are validated on the server against the Turso admins table.
     * NEVER validates credentials client-side.
     */
    async loginAdmin(id, password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setSession({ id: data.adminId, role: 'admin' });
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Invalid credentials' };
            }
        } catch (e) {
            console.error('Admin login error:', e);
            return { success: false, error: 'Network error. Please try again.' };
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
        return this.save();
    },

    updateWorker(id, updates) {
        const idx = this.state.workers.findIndex(w => w.id === id);
        if (idx !== -1) {
            this.state.workers[idx] = { ...this.state.workers[idx], ...updates };
            return this.save();
        }
        return Promise.resolve(false);
    },

    deleteWorker(id) {
        this.state.workers = this.state.workers.filter(w => w.id !== id);
        return this.save();
    }
};
