/**
 * Construction Management System - Bundled Script
 * Admin credentials are validated server-side via /api/auth
 * Compatible with Cloudflare Pages Functions
 */

(function () {
    // ==========================================
    // 1. Utilities
    // ==========================================
    const Utils = {
        // Theme
        toggleTheme: () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            Utils.initIcons();
        },
        initTheme: () => {
            const stored = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', stored);
        },

        // Icons
        initIcons: () => {
            if (window.lucide) {
                window.lucide.createIcons();
            }
        },

        // Date
        calculateAge: (dobString) => {
            if (!dobString) return 0;
            const today = new Date();
            const birthDate = new Date(dobString);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        },

        // Math / Scoring
        safeSqrt: (val) => Math.sqrt(Math.max(0, val)),

        getFitnessLevel: (score) => {
            const s = parseFloat(score || 0);
            if (s >= 7.0) return { label: 'Fit', color: 'var(--success)' };
            if (s >= 4.0) return { label: 'Average', color: 'var(--warning)' };
            return { label: 'Unfit', color: 'var(--danger)' };
        },

        formatDate: (isoString) => {
            if (!isoString) return 'N/A';
            return new Date(isoString).toLocaleDateString();
        },

        calculateScore: ({ height, weight, age, experience, rating }) => {
            // Height Score (h)
            const hScore = 10 * Math.max(0, Math.min(
                Utils.safeSqrt((height - 142) / 30),
                Utils.safeSqrt((198 - height) / 26)
            ));

            // Weight Score (w)
            const wScore = 10 * Math.max(0, Math.min(
                Utils.safeSqrt((weight - 50) / 15),
                Utils.safeSqrt((90 - weight) / 25)
            ));

            // Age Score (a)
            const aScore = 10 * Math.max(0, Math.min(
                Utils.safeSqrt((age - 18) / 12),
                1,
                Utils.safeSqrt((60 - age) / 20)
            ));

            // Experience Score (e)
            const eScore = 10 * Math.max(0, Math.min(
                Math.pow(experience / 7, 1.5),
                1
            ));

            const pScore = rating;

            const total = (hScore * 0.15) + (wScore * 0.15) + (aScore * 0.15) + (eScore * 0.15) + (pScore * 0.4);

            return {
                total: total.toFixed(2),
                details: { hScore, wScore, aScore, eScore, pScore }
            };
        },

        generateRoutine: (bmi) => {
            let food = "";
            let exercise = "";
            let health = "";

            if (bmi <= 15.9) {
                food = "Eat high-calorie meals with large portions of rice or roti, dal, eggs, milk, fish, or meat. Include healthy fats such as cooking oil or ghee. Take frequent snacks like nuts or yogurt between meals.";
                exercise = "Perform light mobility exercises for 10–15 minutes, including gentle stretching of back, shoulders, and legs. Avoid heavy workouts beyond normal construction tasks.";
                health = "Stay well hydrated, rest adequately, and monitor for fatigue or dizziness. Consult a doctor if persistent weakness occurs.";
            } else if (bmi < 17.0) {
                food = "Eat calorie-rich meals with consistent protein sources in every meal (eggs, chickpeas, chicken). Include fruits and vegetables for micronutrients. Do not skip breakfast.";
                exercise = "Do light strength exercises like slow squats, wall push-ups, or planks for 10–15 minutes. Continue normal construction work.";
                health = "Drink plenty of water, take breaks in hot weather, and monitor muscle fatigue. Sleep at least 7–8 hours nightly.";
            } else if (bmi < 18.0) {
                food = "Eat energy-rich meals, including carbohydrates (rice, potatoes), protein (dal, eggs, fish), and moderate healthy fats. Take mid-day snacks such as fruit, boiled eggs, or nuts.";
                exercise = "Add basic core exercises like planks and bridges for 10–20 minutes alongside normal construction work.";
                health = "Focus on posture, reduce back strain, and rest adequately after work. Hydrate frequently.";
            } else if (bmi < 18.5) {
                food = "Eat balanced meals with slightly increased carbohydrate portions to support stamina. Include vegetables and fruits in each meal.";
                exercise = "Perform strength and core exercises for 15–20 minutes after work to prevent fatigue and injury.";
                health = "Take short breaks during work for stretching. Maintain hydration and regular sleep.";
            } else if (bmi < 19.0) {
                food = "Eat balanced meals with rice/roti, vegetables, and a protein source. Include snacks like fruits or yogurt if hungry between meals.";
                exercise = "Continue normal construction work and add bodyweight strength exercises like push-ups, squats, and planks for 15–20 minutes.";
                health = "Stretch after work to reduce joint stiffness. Stay hydrated and maintain good sleep hygiene.";
            } else if (bmi < 19.5) {
                food = "Eat balanced meals with equal portions of carbohydrates, protein, and vegetables. Avoid skipping meals.";
                exercise = "Perform 15–25 minutes of strength exercises (push-ups, squats, planks) after work.";
                health = "Take 5–10 minute stretching breaks during work. Monitor hydration and prevent repetitive strain injuries.";
            } else if (bmi < 20.0) {
                food = "Eat balanced meals with moderate extra protein (add an egg, yogurt, or lentils). Include vegetables and fruits.";
                exercise = "Do bodyweight strength exercises for 15–25 minutes after construction work. Focus on core, back, and legs.";
                health = "Practice stretching and mobility exercises daily. Sleep 7–8 hours and hydrate properly.";
            } else if (bmi < 20.5) {
                food = "Eat balanced meals with a slightly higher protein portion. Include vegetables and whole grains. Avoid sugary drinks and fried snacks.";
                exercise = "Continue bodyweight strength exercises after work. Include 5–10 minutes of mobility stretches.";
                health = "Monitor joint comfort and back health. Stay hydrated throughout the workday.";
            } else if (bmi < 21.0) {
                food = "Eat balanced meals with protein in every meal. Include fruits and vegetables. Limit fried and sugary foods.";
                exercise = "Perform strength and core exercises for 15–25 minutes after work. Focus on back, legs, and shoulders.";
                health = "Stretch daily. Ensure adequate sleep and maintain hydration. Avoid overexertion.";
            } else if (bmi < 21.5) {
                food = "Eat balanced meals, avoid empty calories, include vegetables and protein. Take light snacks if hungry between meals.";
                exercise = "Do 15–25 minutes of bodyweight strength exercises after work. Include core and back strengthening.";
                health = "Maintain proper lifting posture. Stretch daily and rest sufficiently.";
            } else if (bmi < 22.0) {
                food = "Eat balanced meals with moderate protein and vegetables. Avoid sugary drinks.";
                exercise = "Perform strength and mobility exercises after work. Include squats, push-ups, and planks for 15–20 minutes.";
                health = "Monitor for fatigue, maintain hydration, and take breaks during work.";
            } else if (bmi < 22.5) {
                food = "Eat balanced meals with rice/roti, protein, and vegetables. Include fruits and fiber-rich foods.";
                exercise = "Focus on mobility exercises after work for 10–15 minutes to prevent stiffness. Include light stretching.";
                health = "Take regular breaks, hydrate well, and avoid prolong static posture during work.";
            } else if (bmi < 23.0) {
                food = "Eat balanced meals with moderate carbohydrates and protein. Include vegetables in each meal. Limit sugary foods.";
                exercise = "Perform mobility and stretching exercises for 10–15 minutes after work. Avoid heavy additional strength exercises.";
                health = "Monitor joints and back. Maintain hydration and sleep.";
            } else if (bmi < 23.5) {
                food = "Eat clean home-cooked meals. Avoid fried snacks and sugary drinks. Focus on vegetables, protein, and moderate rice/roti.";
                exercise = "Do only normal construction work. Add light stretching if muscles feel stiff.";
                health = "Rest well and hydrate. Avoid overexertion during shifts.";
            } else if (bmi < 24.0) {
                food = "Continue clean meals with moderate portions. Include fiber and protein in each meal.";
                exercise = "Rely on normal work for physical activity. Stretching can be added if needed.";
                health = "Monitor joints, hydration, and energy levels.";
            } else if (bmi < 24.5) {
                food = "Reduce carbohydrate portions slightly, especially in the evening. Focus on vegetables, protein, and fiber.";
                exercise = "Do light mobility exercises for 10–15 minutes after work.";
                health = "Check for early signs of weight gain or joint discomfort. Maintain hydration.";
            } else if (bmi < 25.0) {
                food = "Continue light carb control and include fiber-rich vegetables. Avoid fried and sugary foods.";
                exercise = "Do light mobility exercises for 10–15 minutes. Continue normal work.";
                health = "Monitor knees, back, and joints. Stay hydrated and get adequate rest.";
            } else if (bmi < 26.0) {
                food = "Eat smaller meals with high protein and fiber. Include vegetables and lean protein in each meal. Avoid excess carbs and fried foods.";
                exercise = "Add moderate cardio such as brisk walking for 20–30 minutes after work.";
                health = "Monitor blood pressure and joint stress. Take breaks to avoid fatigue.";
            } else if (bmi < 27.0) {
                food = "Eat protein and fiber-rich meals. Limit refined carbs and oils. Include fruits and vegetables.";
                exercise = "Perform 20–30 minutes of moderate cardio in addition to normal work.";
                health = "Monitor knees, ankles, and joints. Avoid overexertion and stay hydrated.";
            } else if (bmi < 28.0) {
                food = "Control portion sizes and eat slowly. Include protein, vegetables, and whole grains. Avoid sugary drinks and fried foods.";
                exercise = "Perform cardio such as brisk walking or cycling for 20–30 minutes. Continue normal work.";
                health = "Monitor for fatigue and breathlessness. Take short rest breaks during work.";
            } else if (bmi < 29.0) {
                food = "Eat low-oil, low-sugar meals. Include vegetables, lean protein, and moderate carbs.";
                exercise = "Perform moderate cardio (walking, cycling) for 20–30 minutes after work.";
                health = "Pay attention to joint and back strain. Maintain hydration.";
            } else if (bmi < 30.0) {
                food = "Eat light meals with moderate protein and fiber. Avoid heavy foods and fried snacks.";
                exercise = "Perform light mobility exercises and stretching for 10–15 minutes. Continue normal work.";
                health = "Focus on joint comfort and recovery. Stay hydrated and get enough rest.";
            } else if (bmi < 31.0) {
                food = "Eat light, fiber-rich meals with vegetables and lean protein. Avoid sugary and oily foods.";
                exercise = "Perform low-impact cardio such as walking for 30 minutes after work. Stretch regularly.";
                health = "Monitor blood pressure, knees, and back. Avoid overexertion.";
            } else if (bmi < 33.0) {
                food = "Eat small, frequent meals with high protein and fiber. Include fruits and vegetables. Limit rice/roti portions.";
                exercise = "Perform steady, low-intensity walking for 30 minutes. Continue mobility exercises.";
                health = "Avoid sudden or heavy movements. Monitor joints and back.";
            } else if (bmi < 34.0) {
                food = "Control total calories while keeping meals nutrient-dense. Focus on protein and vegetables.";
                exercise = "Perform light mobility and stretching exercises only. Avoid heavy cardio.";
                health = "Monitor fatigue, breathing, and recovery time. Stay hydrated.";
            } else if (bmi < 35.0) {
                food = "Eat very light, easily digestible meals with high fiber. Include soups, vegetables, and liquid nutrition.";
                exercise = "Perform stretching and gentle mobility exercises for 10–15 minutes. Avoid cardio.";
                health = "Focus on reducing strain, preventing injuries, and hydration.";
            } else if (bmi < 37.0) {
                food = "Follow a medical-aware diet: low salt, low sugar, and moderate protein/fiber.";
                exercise = "Perform gentle walking and light mobility exercises only.";
                health = "Monitor blood pressure, heart rate, joints, and back. Consult a medical professional regularly.";
            } else if (bmi < 40.0) {
                food = "Eat under supervision with controlled calories, focusing on high fiber, lean protein, and vegetables.";
                exercise = "Limit physical activity to very light movements and stretching. Avoid cardio and strenuous tasks.";
                health = "Continuous monitoring of blood pressure, joints, heart, and back. Avoid overexertion.";
            } else {
                food = "Follow strict medical supervision with individualized diet plans, emphasizing low salt, low sugar, and nutrient-dense meals.";
                exercise = "Only perform medical-guided activities approved by a doctor. Avoid normal construction work if unsafe.";
                health = "Continuous health monitoring for cardiovascular, metabolic, and musculoskeletal risks.";
            }

            return { food, exercise, health };
        }
    };

    // ==========================================
    // 2. UI Components
    // ==========================================
    const UI = {
        Button: ({ text, onClick, variant = 'primary', type = 'button', className = '', id = '' }) => {
            return `
                <button
                    type="${type}"
                    class="btn btn-${variant} ${className}"
                    ${id ? `id="${id}"` : ''}
                    ${typeof onClick === 'string' ? `onclick="${onClick}"` : ''}
                >
                    ${text}
                </button>
            `;
        },

        Input: ({ label, type = 'text', id, placeholder = '', required = false, value = '' }) => {
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
        },

        Card: ({ title, children, className = '' }) => {
            return `
                <div class="glass-card ${className}">
                    ${title ? `<h2 class="card-title">${title}</h2>` : ''}
                    <div class="card-content">
                        ${children}
                    </div>
                </div>
            `;
        },

        Modal: ({ id, title, children }) => {
            return `
                <div id="${id}" class="modal-overlay hidden">
                    <div class="glass-card modal-content">
                        <div class="modal-header">
                            <h2>${title}</h2>
                            <button class="close-modal-btn" type="button" onclick="document.getElementById('${id}').classList.add('hidden')">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${children}
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // ==========================================
    // 3. State Management (AppContext)
    // ==========================================
    const AppContext = {
        // NO hardcoded admins! Server-side auth only.
        state: {
            workers: [],
            sortOption: 'new'
        },
        currentUser: null,

        async init() {
            try {
                const response = await fetch('/api/data');
                if (response.ok) {
                    const data = await response.json();
                    // Strip any leaked admins array from old data
                    if (data.admins) {
                        delete data.admins;
                    }
                    // Migrate legacy complaints to messages
                    if (data.workers) {
                        data.workers.forEach(worker => {
                            if (worker.reports) {
                                worker.reports.forEach(report => {
                                    if (!report.messages) report.messages = [];
                                    if (report.complaint) {
                                        report.messages.push({
                                            sender: 'worker',
                                            content: report.complaint,
                                            timestamp: new Date().toISOString(),
                                            seenAt: null
                                        });
                                        delete report.complaint;
                                    }
                                });
                            }
                        });
                    }
                    this.state = data;
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }

            const session = localStorage.getItem('construction_app_session');
            if (session) {
                try {
                    this.currentUser = JSON.parse(session);
                } catch {
                    this.currentUser = null;
                }
            }
        },

        async save() {
            try {
                // Clean state before saving (never save admins to app_state)
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
                console.error('Failed to save data:', e);
                return false;
            }
        },

        /**
         * Server-side admin login via /api/auth
         * Credentials are validated against the Turso admins table on the server.
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
            localStorage.setItem('construction_app_session', JSON.stringify(user));
        },

        clearSession() {
            this.currentUser = null;
            localStorage.removeItem('construction_app_session');
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
        },

        // Chat Logic
        canSendMessage(report, userRole) {
            if (!report.messages || report.messages.length === 0) {
                return true;
            }
            const lastMsg = report.messages[report.messages.length - 1];
            if (lastMsg.seenAt) return true;
            return lastMsg.sender !== userRole;
        },

        canEditMessage(message, userRole) {
            if (message.sender !== userRole) return false;
            if (message.seenAt) return false;
            const now = new Date();
            const sent = new Date(message.timestamp);
            const diffMins = (now - sent) / 1000 / 60;
            return diffMins <= 5;
        },

        addMessage(workerId, reportIdx, content, role) {
            const worker = this.getWorker(workerId);
            if (!worker || !worker.reports[reportIdx]) return;
            const report = worker.reports[reportIdx];
            if (!report.messages) report.messages = [];
            report.messages.push({
                sender: role,
                content: content,
                timestamp: new Date().toISOString(),
                seenAt: null
            });
            this.save();
        },

        editMessage(workerId, reportIdx, msgIdx, newContent) {
            const worker = this.getWorker(workerId);
            if (!worker) return;
            const msg = worker.reports[reportIdx].messages[msgIdx];
            if (msg) {
                msg.content = newContent;
                msg.editedAt = new Date().toISOString();
                this.save();
            }
        },

        markLastMessageSeen(workerId, reportIdx, viewerRole) {
            const worker = this.getWorker(workerId);
            if (!worker) return;
            const msgs = worker.reports[reportIdx].messages;
            if (msgs && msgs.length > 0) {
                const last = msgs[msgs.length - 1];
                if (last.sender !== viewerRole && !last.seenAt) {
                    last.seenAt = new Date().toISOString();
                    this.save();
                }
            }
        }
    };

    // ==========================================
    // 4. Pages
    // ==========================================
    const Pages = {
        Home: {
            async render() {
                return `
                    <div class="container flex-center" style="min-height: 100vh; position: relative;">
                        <!-- Theme Toggle -->
                        <div style="position: absolute; top: 1rem; right: 1rem;">
                            ${UI.Button({ text: '<i data-lucide="sun"></i> / <i data-lucide="moon"></i>', variant: 'secondary', onClick: 'window.toggleThemeGlobal()' })}
                        </div>

                        <div style="max-width: 480px; width: 100%;">
                            <div class="text-center" style="margin-bottom: 2rem; text-align: center;">
                                <h1 class="text-gradient" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">Construction<br>Manager</h1>
                                <p style="color: var(--text-muted);">Building Futures, Not Just Structures</p>
                            </div>

                            ${UI.Card({
                    title: 'Worker Portal',
                    children: `
                                    <form id="worker-login-form">
                                        ${UI.Input({ label: 'Enter Worker ID', id: 'worker-id', placeholder: 'e.g., W001', required: true })}
                                        ${UI.Button({ text: 'Profile Details', type: 'submit', variant: 'primary', className: 'btn-block' })}
                                        <div style="margin-top: 1rem;">
                                            ${UI.Button({ text: 'ASK AI', variant: 'primary', className: 'btn-block', onClick: "window.location.href='/ai.html'" })}
                                        </div>
                                    </form>
                                    <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                                        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted);">Are you a manager?</p>
                                        ${UI.Button({ text: 'Admin Login', variant: 'secondary', className: 'btn-block', id: 'admin-btn' })}
                                    </div>
                                `
                })}
                        </div>
                    </div>
                `;
            },
            afterRender() {
                document.getElementById('worker-login-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const workerId = document.getElementById('worker-id').value.trim();
                    const worker = AppContext.getWorker(workerId);
                    if (worker) {
                        AppContext.setSession(worker);
                        Router.navigate('/worker_results');
                    } else {
                        alert('Invalid Worker ID. Please try again.');
                    }
                });
                document.getElementById('admin-btn').addEventListener('click', () => Router.navigate('/admin_login'));
            }
        },

        AdminLogin: {
            async render() {
                return `
                    <div class="container flex-center" style="min-height: 100vh;">
                        <div style="max-width: 400px; width: 100%;">
                            ${UI.Card({
                    title: 'Admin Login',
                    children: `
                                    <form id="admin-login-form">
                                        ${UI.Input({ label: 'Admin ID', id: 'admin-id', placeholder: 'Enter Admin ID', required: true })}
                                        ${UI.Input({ label: 'Password', id: 'admin-password', type: 'password', placeholder: 'Enter Password', required: true })}
                                        ${UI.Button({ text: 'Login', type: 'submit', variant: 'primary', className: 'btn-block' })}
                                    </form>
                                    <div style="margin-top: 1rem; text-align: center;">
                                        ${UI.Button({ text: 'Back to Home', variant: 'secondary', className: 'btn-block', id: 'back-btn' })}
                                    </div>
                                `
                })}
                        </div>
                    </div>
                `;
            },
            afterRender() {
                // Server-side admin login via /api/auth
                document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const loginBtn = e.target.querySelector('button[type="submit"]');
                    const originalText = loginBtn.innerHTML;
                    loginBtn.innerHTML = 'Logging in...';
                    loginBtn.disabled = true;

                    const id = document.getElementById('admin-id').value.trim();
                    const password = document.getElementById('admin-password').value.trim();

                    // Validate credentials server-side
                    const result = await AppContext.loginAdmin(id, password);

                    if (result.success) {
                        Router.navigate('/admin_page');
                    } else {
                        alert(result.error || 'Invalid Credentials!');
                        loginBtn.innerHTML = originalText;
                        loginBtn.disabled = false;
                    }
                });
                document.getElementById('back-btn').addEventListener('click', () => Router.navigate('/'));
            }
        },

        AdminDashboard: {
            async render() {
                if (!AppContext.currentUser || AppContext.currentUser.role !== 'admin') {
                    Router.navigate('/admin_login');
                    return '';
                }
                const workers = [...AppContext.state.workers];
                const sortField = AppContext.state.sortField || 'createdAt';
                const sortOrder = AppContext.state.sortOrder || 'desc';

                workers.sort((a, b) => {
                    let valA, valB;

                    switch (sortField) {
                        case 'name':
                            valA = (a.name || '').toLowerCase();
                            valB = (b.name || '').toLowerCase();
                            break;
                        case 'totalScore':
                            valA = parseFloat(a.totalScore || 0);
                            valB = parseFloat(b.totalScore || 0);
                            break;
                        case 'experience':
                            valA = parseInt(a.experience || 0);
                            valB = parseInt(b.experience || 0);
                            break;
                        case 'bmi':
                            valA = a.weight / ((a.height / 100) ** 2);
                            valB = b.weight / ((b.height / 100) ** 2);
                            break;
                        case 'strikes':
                            valA = a.strikes || 0;
                            valB = b.strikes || 0;
                            break;
                        case 'createdAt':
                        default:
                            valA = new Date(a.createdAt || 0);
                            valB = new Date(b.createdAt || 0);
                            break;
                    }

                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

                const renderWorkerRow = (worker) => {
                    const fitness = Utils.getFitnessLevel(worker.totalScore);
                    const hasFiveStrikes = (worker.strikes || 0) >= 5;
                    const rowBg = hasFiveStrikes ? '#fff4f4ff' : 'var(--bg-card)';

                    return `
                    <div class="worker-row glass-card" style="padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; background-color: ${rowBg}; border: ${hasFiveStrikes ? '1px solid #ef4444' : '1px solid var(--border)'};">
                        <div style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="margin-bottom: 0.25rem;">${worker.name} <span style="font-size: 0.8rem; opacity: 0.7;">(${worker.id})</span></h3>
                            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                                <div>
                                    <span style="color: ${fitness.color}; font-weight: 600;">${fitness.label}</span>
                                    ${worker.strikes > 0 ? `
                                        <span style="display:inline-flex; gap:2px; margin-left:0.5rem; vertical-align:middle;">
                                            ${Array(worker.strikes).fill(0).map(() => `<div style="width:10px; height:10px; background:var(--danger); border-radius:1px;"></div>`).join('')}
                                        </span>
                                    ` : ''}
                                </div>
                                <div>Rating: ${worker.rating} | Age: ${Utils.calculateAge(worker.dob)} | Joined: ${Utils.formatDate(worker.createdAt)}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                             ${UI.Button({ text: '<i data-lucide="file-text"></i> Report', className: 'btn-sm btn-secondary', onClick: `window.location.hash='#/worker_results?id=${worker.id}'` })}
                             ${UI.Button({ text: '<i data-lucide="trash-2"></i>', className: 'btn-sm btn-danger', onClick: `window.deleteWorkerGlobal('${worker.id}')`, title: 'Delete Worker' })}
                        </div>
                    </div>
                `;
                };

                // Global Delete Handler
                window.deleteWorkerGlobal = (id) => {
                    if (confirm('Are you sure you want to delete this worker? This cannot be undone.')) {
                        AppContext.deleteWorker(id);
                        Router.handleRoute();
                    }
                };

                window.clearGlobalHistory = () => {
                    if (confirm('Are you sure you want to clear ALL payment history for ALL workers? This cannot be undone.')) {
                        AppContext.state.workers.forEach(w => w.paymentHistory = []);
                        AppContext.save();
                        Router.handleRoute();
                    }
                };

                window.clearWorkerHistory = (workerId) => {
                    if (confirm('Are you sure you want to clear the payment history for this worker?')) {
                        const worker = AppContext.getWorker(workerId);
                        if (worker) {
                            worker.paymentHistory = [];
                            AppContext.save();
                            Router.handleRoute();
                        }
                    }
                };

                return `
                    <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <div>
                                <h1>Dashboard</h1>
                                <p style="color: var(--text-muted);">Welcome, Manager.</p>
                            </div>
                             <div style="display: flex; gap: 0.5rem;">
                                 ${UI.Button({ text: '<i data-lucide="download"></i> Backup Data', id: 'backup-btn', variant: 'secondary' })}
                                 ${UI.Button({ text: 'Logout', id: 'logout-btn', variant: 'secondary' })}
                            </div>
                        </header>

                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <label style="font-size: 0.85rem; color: var(--text-muted);">Sort by:</label>
                                <select id="sort-field" style="padding: 0.5rem; border-radius: 0.5rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border);">
                                    <option value="createdAt" ${sortField === 'createdAt' ? 'selected' : ''}>Time</option>
                                    <option value="name" ${sortField === 'name' ? 'selected' : ''}>Name</option>
                                    <option value="totalScore" ${sortField === 'totalScore' ? 'selected' : ''}>Total Score</option>
                                    <option value="experience" ${sortField === 'experience' ? 'selected' : ''}>Experience</option>
                                    <option value="bmi" ${sortField === 'bmi' ? 'selected' : ''}>BMI</option>
                                    <option value="strikes" ${sortField === 'strikes' ? 'selected' : ''}>Strike</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <label style="font-size: 0.85rem; color: var(--text-muted);">Order:</label>
                                <select id="sort-order" style="padding: 0.5rem; border-radius: 0.5rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border);">
                                    <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>Ascending</option>
                                    <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>Descending</option>
                                </select>
                            </div>
                            <div style="margin-left: auto; display: flex; gap: 0.5rem;">
                                ${UI.Button({ text: '<i data-lucide="plus"></i> Add Worker', id: 'add-worker-btn', variant: 'primary' })}
                            </div>
                        </div>

                        <div id="worker-list">
                            ${workers.length > 0 ? workers.map(renderWorkerRow).join('') : '<p style="text-align:center; color: var(--text-muted);">No workers found.</p>'}
                        </div>
                    </div>

                    <!-- Add Worker Modal -->
                    ${UI.Modal({
                    id: 'add-worker-modal',
                    title: 'Add New Worker',
                    children: `
                        <form id="add-worker-form">
                            ${UI.Input({ label: 'Full Name', id: 'w-name', required: true })}
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                ${UI.Input({ label: 'Height (cm)', id: 'w-height', type: 'number', required: true })}
                                ${UI.Input({ label: 'Weight (kg)', id: 'w-weight', type: 'number', required: true })}
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                ${UI.Input({ label: 'Date of Birth', id: 'w-dob', type: 'date', required: true })}
                                ${UI.Input({ label: 'Experience (Years)', id: 'w-exp', type: 'number', required: true })}
                            </div>
                            ${UI.Input({ label: 'Personal Rating (0-10)', id: 'w-rating', type: 'number', required: true, placeholder: '0-10' })}

                            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                ${UI.Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn', id: 'cancel-add' })}
                                ${UI.Button({ text: 'Add Worker', type: 'submit', variant: 'primary' })}
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
                    document.getElementById('add-worker-form').reset();
                };
                const closeModal = () => modal.classList.add('hidden');

                document.getElementById('add-worker-btn').addEventListener('click', openModal);
                document.querySelectorAll('.close-modal-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
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

                        const addText = (text, size, isBold = false, color = '#1e293b') => {
                            pdf.setFontSize(size);
                            pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                            pdf.setTextColor(color);
                            pdf.text(text, margin, y);
                            y += size * 0.5 + 2;
                        };

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
                document.getElementById('add-worker-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const name = document.getElementById('w-name').value.trim();
                    const height = parseFloat(document.getElementById('w-height').value);
                    const weight = parseFloat(document.getElementById('w-weight').value);
                    const dob = document.getElementById('w-dob').value;
                    const experience = parseFloat(document.getElementById('w-exp').value);
                    const rating = parseFloat(document.getElementById('w-rating').value);

                    if (!name || !height || !weight || !dob || isNaN(experience) || isNaN(rating)) {
                        alert('Please fill in all fields correctly.');
                        return;
                    }

                    const age = Utils.calculateAge(dob);
                    const id = 'W' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const scoreData = Utils.calculateScore({ height, weight, age, experience, rating });

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
                        status: 'Pending',
                        createdAt: new Date().toISOString()
                    };

                    const saved = await AppContext.addWorker(newWorker);
                    if (saved) {
                        closeModal();
                        Router.handleRoute();
                    } else {
                        alert('Failed to save worker. Please try again.');
                    }
                });

                // Sorting Logic
                const sortFieldEl = document.getElementById('sort-field');
                const sortOrderEl = document.getElementById('sort-order');

                const applySort = () => {
                    AppContext.state.sortField = sortFieldEl.value;
                    AppContext.state.sortOrder = sortOrderEl.value;
                    Router.handleRoute();
                };

                if (sortFieldEl) sortFieldEl.addEventListener('change', applySort);
                if (sortOrderEl) sortOrderEl.addEventListener('change', applySort);
            }
        },

        WorkerResults: {
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

                const routine = Utils.generateRoutine(worker.weight / ((worker.height / 100) ** 2));

                // Mark last message as seen when admin views
                if (isAdminView && worker.reports) {
                    worker.reports.forEach((report, idx) => {
                        AppContext.markLastMessageSeen(workerId, idx, 'admin');
                    });
                }
                // Mark as seen when worker views
                if (!isAdminView && AppContext.currentUser && worker.reports) {
                    worker.reports.forEach((report, idx) => {
                        AppContext.markLastMessageSeen(workerId, idx, 'worker');
                    });
                }

                return `
                    <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                        <div style="margin-bottom: 1rem;">
                            ${UI.Button({ text: 'Back', variant: 'secondary', onClick: isAdminView ? "window.location.hash='#/admin_page'" : "window.location.hash='#/'" })}
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
                                ${UI.Card({
                    title: 'Profile Details',
                    children: `
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.95rem;">
                                            <div><strong>Age:</strong> ${Utils.calculateAge(worker.dob)}</div>
                                            <div><strong>Experience:</strong> ${worker.experience} Years</div>
                                            <div><strong>Height:</strong> ${worker.height} cm</div>
                                            <div><strong>Weight:</strong> ${worker.weight} kg</div>
                                            <div><strong>Status:</strong> ${worker.status}</div>
                                            <div><strong>Rating:</strong> ${worker.rating}/10</div>
                                        </div>
                                    `
                })}

                                ${UI.Card({
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
                                    ${UI.Button({ text: '+ New Report', id: 'new-report-btn', variant: 'primary' })}
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
                            ${UI.Button({ text: '<i data-lucide="download"></i> Download PDF', id: 'pdf-btn', variant: 'secondary' })}
                        </div>
                    </div>

                    <!-- Add Report Modal -->
                    ${UI.Modal({
                    id: 'report-modal',
                    title: 'Create New Report',
                    children: `
                        <form id="report-form">
                            <div class="input-group">
                                <label>Report Content</label>
                                <textarea id="report-content" rows="5" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 0.5rem; color: white;"></textarea>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                                 ${UI.Button({ text: 'Cancel', variant: 'secondary', className: 'close-modal-btn' })}
                                 ${UI.Button({ text: 'Submit Report', type: 'submit', variant: 'primary' })}
                            </div>
                        </form>
                    `
                })}
                `;
            },

            afterRender() {
                // Modal Logic
                const modal = document.getElementById('report-modal');
                const newReportBtn = document.getElementById('new-report-btn');
                if (newReportBtn) {
                    newReportBtn.addEventListener('click', () => {
                        modal.classList.remove('hidden');
                    });
                }
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
        }
    };

    // ==========================================
    // 5. Router
    // ==========================================
    const routes = {
        '/': Pages.Home,
        '/admin_login': Pages.AdminLogin,
        '/admin_page': Pages.AdminDashboard,
        '/worker_results': Pages.WorkerResults
    };

    const Router = {
        init() {
            window.addEventListener('hashchange', this.handleRoute.bind(this));
            this.handleRoute();
        },

        async handleRoute() {
            let hash = window.location.hash.slice(1) || '/';
            const queryIndex = hash.indexOf('?');
            if (queryIndex !== -1) {
                hash = hash.substring(0, queryIndex);
            }

            const page = routes[hash] || Pages.Home;
            const app = document.getElementById('app');

            app.innerHTML = await page.render();

            if (page.afterRender) {
                page.afterRender();
            }

            // Re-initialize icons for new content
            Utils.initIcons();
        },

        navigate(path) {
            window.location.hash = path;
        }
    };

    // ==========================================
    // 6. Global Helpers
    // ==========================================
    window.toggleThemeGlobal = () => Utils.toggleTheme();

    // ==========================================
    // 7. Init
    // ==========================================
    document.addEventListener('DOMContentLoaded', async () => {
        Utils.initTheme();
        await AppContext.init();
        Router.init();
        Utils.initIcons();
    });
})();
