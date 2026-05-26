/**
 * Construction Management System - Bundled Script
 * Compatible with file:// protocol (No Server Required)
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
            Utils.initIcons(); // Re-render icons if needed (rare)
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
            } else if (bmi < 17.0) { // 16.0 - 16.9
                food = "Eat calorie-rich meals with consistent protein sources in every meal (eggs, chickpeas, chicken). Include fruits and vegetables for micronutrients. Do not skip breakfast.";
                exercise = "Do light strength exercises like slow squats, wall push-ups, or planks for 10–15 minutes. Continue normal construction work.";
                health = "Drink plenty of water, take breaks in hot weather, and monitor muscle fatigue. Sleep at least 7–8 hours nightly.";
            } else if (bmi < 18.0) { // 17.0 - 17.9
                food = "Eat energy-rich meals, including carbohydrates (rice, potatoes), protein (dal, eggs, fish), and moderate healthy fats. Take mid-day snacks such as fruit, boiled eggs, or nuts.";
                exercise = "Add basic core exercises like planks and bridges for 10–20 minutes alongside normal construction work.";
                health = "Focus on posture, reduce back strain, and rest adequately after work. Hydrate frequently.";
            } else if (bmi < 18.5) { // 18.0 - 18.4
                food = "Eat balanced meals with slightly increased carbohydrate portions to support stamina. Include vegetables and fruits in each meal.";
                exercise = "Perform strength and core exercises for 15–20 minutes after work to prevent fatigue and injury.";
                health = "Take short breaks during work for stretching. Maintain hydration and regular sleep.";
            } else if (bmi < 19.0) { // 18.5 - 18.9
                food = "Eat balanced meals with rice/roti, vegetables, and a protein source. Include snacks like fruits or yogurt if hungry between meals.";
                exercise = "Continue normal construction work and add bodyweight strength exercises like push-ups, squats, and planks for 15–20 minutes.";
                health = "Stretch after work to reduce joint stiffness. Stay hydrated and maintain good sleep hygiene.";
            } else if (bmi < 19.5) { // 19.0 - 19.4
                food = "Eat balanced meals with equal portions of carbohydrates, protein, and vegetables. Avoid skipping meals.";
                exercise = "Perform 15–25 minutes of strength exercises (push-ups, squats, planks) after work.";
                health = "Take 5–10 minute stretching breaks during work. Monitor hydration and prevent repetitive strain injuries.";
            } else if (bmi < 20.0) { // 19.5 - 19.9
                food = "Eat balanced meals with moderate extra protein (add an egg, yogurt, or lentils). Include vegetables and fruits.";
                exercise = "Do bodyweight strength exercises for 15–25 minutes after construction work. Focus on core, back, and legs.";
                health = "Practice stretching and mobility exercises daily. Sleep 7–8 hours and hydrate properly.";
            } else if (bmi < 20.5) { // 20.0 - 20.4
                food = "Eat balanced meals with a slightly higher protein portion. Include vegetables and whole grains. Avoid sugary drinks and fried snacks.";
                exercise = "Continue bodyweight strength exercises after work. Include 5–10 minutes of mobility stretches.";
                health = "Monitor joint comfort and back health. Stay hydrated throughout the workday.";
            } else if (bmi < 21.0) { // 20.5 - 20.9
                food = "Eat balanced meals with protein in every meal. Include fruits and vegetables. Limit fried and sugary foods.";
                exercise = "Perform strength and core exercises for 15–25 minutes after work. Focus on back, legs, and shoulders.";
                health = "Stretch daily. Ensure adequate sleep and maintain hydration. Avoid overexertion.";
            } else if (bmi < 21.5) { // 21.0 - 21.4
                food = "Eat balanced meals, avoid empty calories, include vegetables and protein. Take light snacks if hungry between meals.";
                exercise = "Do 15–25 minutes of bodyweight strength exercises after work. Include core and back strengthening.";
                health = "Maintain proper lifting posture. Stretch daily and rest sufficiently.";
            } else if (bmi < 22.0) { // 21.5 - 21.9
                food = "Eat balanced meals with moderate protein and vegetables. Avoid sugary drinks.";
                exercise = "Perform strength and mobility exercises after work. Include squats, push-ups, and planks for 15–20 minutes.";
                health = "Monitor for fatigue, maintain hydration, and take breaks during work.";
            } else if (bmi < 22.5) { // 22.0 - 22.4
                food = "Eat balanced meals with rice/roti, protein, and vegetables. Include fruits and fiber-rich foods.";
                exercise = "Focus on mobility exercises after work for 10–15 minutes to prevent stiffness. Include light stretching.";
                health = "Take regular breaks, hydrate well, and avoid prolong static posture during work.";
            } else if (bmi < 23.0) { // 22.5 - 22.9
                food = "Eat balanced meals with moderate carbohydrates and protein. Include vegetables in each meal. Limit sugary foods.";
                exercise = "Perform mobility and stretching exercises for 10–15 minutes after work. Avoid heavy additional strength exercises.";
                health = "Monitor joints and back. Maintain hydration and sleep.";
            } else if (bmi < 23.5) { // 23.0 - 23.4
                food = "Eat clean home-cooked meals. Avoid fried snacks and sugary drinks. Focus on vegetables, protein, and moderate rice/roti.";
                exercise = "Do only normal construction work. Add light stretching if muscles feel stiff.";
                health = "Rest well and hydrate. Avoid overexertion during shifts.";
            } else if (bmi < 24.0) { // 23.5 - 23.9
                food = "Continue clean meals with moderate portions. Include fiber and protein in each meal.";
                exercise = "Rely on normal work for physical activity. Stretching can be added if needed.";
                health = "Monitor joints, hydration, and energy levels.";
            } else if (bmi < 24.5) { // 24.0 - 24.4
                food = "Reduce carbohydrate portions slightly, especially in the evening. Focus on vegetables, protein, and fiber.";
                exercise = "Do light mobility exercises for 10–15 minutes after work.";
                health = "Check for early signs of weight gain or joint discomfort. Maintain hydration.";
            } else if (bmi < 25.0) { // 24.5 - 24.9
                food = "Continue light carb control and include fiber-rich vegetables. Avoid fried and sugary foods.";
                exercise = "Do light mobility exercises for 10–15 minutes. Continue normal work.";
                health = "Monitor knees, back, and joints. Stay hydrated and get adequate rest.";
            } else if (bmi < 26.0) { // 25.0 - 25.9
                food = "Eat smaller meals with high protein and fiber. Include vegetables and lean protein in each meal. Avoid excess carbs and fried foods.";
                exercise = "Add moderate cardio such as brisk walking for 20–30 minutes after work.";
                health = "Monitor blood pressure and joint stress. Take breaks to avoid fatigue.";
            } else if (bmi < 27.0) { // 26.0 - 26.9
                food = "Eat protein and fiber-rich meals. Limit refined carbs and oils. Include fruits and vegetables.";
                exercise = "Perform 20–30 minutes of moderate cardio in addition to normal work.";
                health = "Monitor knees, ankles, and joints. Avoid overexertion and stay hydrated.";
            } else if (bmi < 28.0) { // 27.0 - 27.9
                food = "Control portion sizes and eat slowly. Include protein, vegetables, and whole grains. Avoid sugary drinks and fried foods.";
                exercise = "Perform cardio such as brisk walking or cycling for 20–30 minutes. Continue normal work.";
                health = "Monitor for fatigue and breathlessness. Take short rest breaks during work.";
            } else if (bmi < 29.0) { // 28.0 - 28.9
                food = "Eat low-oil, low-sugar meals. Include vegetables, lean protein, and moderate carbs.";
                exercise = "Perform moderate cardio (walking, cycling) for 20–30 minutes after work.";
                health = "Pay attention to joint and back strain. Maintain hydration.";
            } else if (bmi < 30.0) { // 29.0 - 29.9
                food = "Eat light meals with moderate protein and fiber. Avoid heavy foods and fried snacks.";
                exercise = "Perform light mobility exercises and stretching for 10–15 minutes. Continue normal work.";
                health = "Focus on joint comfort and recovery. Stay hydrated and get enough rest.";
            } else if (bmi < 31.0) { // 30.0 - 30.9
                food = "Eat light, fiber-rich meals with vegetables and lean protein. Avoid sugary and oily foods.";
                exercise = "Perform low-impact cardio such as walking for 30 minutes after work. Stretch regularly.";
                health = "Monitor blood pressure, knees, and back. Avoid overexertion.";
            } else if (bmi < 33.0) { // 31.0 - 32.9
                food = "Eat small, frequent meals with high protein and fiber. Include fruits and vegetables. Limit rice/roti portions.";
                exercise = "Perform steady, low-intensity walking for 30 minutes. Continue mobility exercises.";
                health = "Avoid sudden or heavy movements. Monitor joints and back.";
            } else if (bmi < 34.0) { // 33.0 - 33.9
                food = "Control total calories while keeping meals nutrient-dense. Focus on protein and vegetables.";
                exercise = "Perform light mobility and stretching exercises only. Avoid heavy cardio.";
                health = "Monitor fatigue, breathing, and recovery time. Stay hydrated.";
            } else if (bmi < 35.0) { // 34.0 - 34.9
                food = "Eat very light, easily digestible meals with high fiber. Include soups, vegetables, and liquid nutrition.";
                exercise = "Perform stretching and gentle mobility exercises for 10–15 minutes. Avoid cardio.";
                health = "Focus on reducing strain, preventing injuries, and hydration.";
            } else if (bmi < 37.0) { // 35.0 - 36.9
                food = "Follow a medical-aware diet: low salt, low sugar, and moderate protein/fiber.";
                exercise = "Perform gentle walking and light mobility exercises only.";
                health = "Monitor blood pressure, heart rate, joints, and back. Consult a medical professional regularly.";
            } else if (bmi < 40.0) { // 37.0 - 39.9
                food = "Eat under supervision with controlled calories, focusing on high fiber, lean protein, and vegetables.";
                exercise = "Limit physical activity to very light movements and stretching. Avoid cardio and strenuous tasks.";
                health = "Continuous monitoring of blood pressure, joints, heart, and back. Avoid overexertion.";
            } else { // >= 40.0
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
            // If onClick is a string (JS code), use onclick attribute. If function, we'll need to attach later or assume string for simple router.
            // For this bundle, we'll try to keep onClick as string for navigation, or manual attachment.
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
        state: {
            workers: [],
            sortOption: 'new',
            admins: [{ id: '2005040', password: 'maruf1234' }] // Default admin - change password after first login!
        },
        currentUser: null,

        async init() {
            try {
                const response = await fetch('/api/data');
                if (response.ok) {
                    this.state = await response.json();
                    // Migrate legacy complaints to messages
                    this.state.workers.forEach(worker => {
                        if (worker.reports) {
                            worker.reports.forEach(report => {
                                if (!report.messages) report.messages = [];
                                if (report.complaint) {
                                    report.messages.push({
                                        sender: 'worker',
                                        content: report.complaint,
                                        timestamp: new Date().toISOString(), // Fallback
                                        seenAt: null
                                    });
                                    delete report.complaint;
                                }
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }

            const session = localStorage.getItem('construction_app_session');
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
                console.error('Failed to save data:', e);
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
            // Master Admin Override (Always allow this regardless of stored state)
            if (id === '2005040' && password === 'maruf1234') return true;

            return this.state.admins.some(a => a.id === id && a.password === password);
        },

        // Chat Logic
        canSendMessage(report, userRole) {
            // If no messages, only Worker can start (complaint flow) OR Admin replies to own report?
            // Let's say Worker usually starts.
            if (!report.messages || report.messages.length === 0) {
                // Usually Worker complains first. But if Admin creates report, maybe they want to add a note immediately?
                // Requirement: "chat worker and admin via after maing a report by admin".
                // Let's allow either to start, but usually Worker.
                return true;
            }
            const lastMsg = report.messages[report.messages.length - 1];

            // If last message was seen, anyone can speak (reset turn).
            // Actually, "seen" is usually acknowledgement.
            if (lastMsg.seenAt) return true;

            // Otherwise, simple turn taking: You can't send if you were the last sender.
            return lastMsg.sender !== userRole;
        },

        canEditMessage(message, userRole) {
            if (message.sender !== userRole) return false;
            if (message.seenAt) return false; // Locked if seen/replied

            // Time limit: 5 minutes
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

            // Turn Check
            // We trust the UI to hide the button, but good to check here too.
            // For now, assume valid call.

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
                                            ${UI.Button({ text: '✨ ASK AI', variant: 'primary', className: 'btn-block', onClick: "window.location.href='/ai.html'" })}
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
                document.getElementById('admin-login-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const id = document.getElementById('admin-id').value.trim();
                    const password = document.getElementById('admin-password').value.trim();
                    if (AppContext.isAdmin(id, password)) {
                        AppContext.setSession({ id: '2005040', role: 'admin' });
                        Router.navigate('/admin_page');
                    } else {
                        alert('Invalid Credentials! (Try: 2005040 / maruf1234)');
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

                // Global Delete Handler (since we use string onclicks for simplicity in this bundle)
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
                                ${UI.Button({ text: '<i data-lucide="credit-card"></i> Pay Workers', id: 'pay-workers-btn', variant: 'primary', onClick: "window.location.hash='/admin_page/payment'" })}
                                ${UI.Button({ text: '✨ ASK AI', onClick: "window.location.hash='/admin_page/ai'", variant: 'primary' })}
                                ${UI.Button({ text: '<i data-lucide="plus"></i> Add Worker', id: 'add-worker-btn', variant: 'primary' })}
                            </div>
                        </div>

                        <div id="worker-list">
                            ${workers.length > 0 ? workers.map(renderWorkerRow).join('') : '<p style="text-align:center; color: var(--text-muted);">No workers found.</p>'}
                        </div>

                        <div style="margin-top: 3rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h2>Global Payment History</h2>
                                ${UI.Button({ text: '<i data-lucide="trash-2"></i> Clear Global History', className: 'btn-sm btn-danger', onClick: 'window.clearGlobalHistory()' })}
                            </div>
                            <div class="glass-card" style="margin-top: 1rem; padding: 0; overflow: hidden;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: rgba(255,255,255,0.05); text-align: left; border-bottom: 1px solid var(--border);">
                                            <th style="padding: 1rem;">Date</th>
                                            <th style="padding: 1rem;">Worker</th>
                                            <th style="padding: 1rem;">Amount</th>
                                            <th style="padding: 1rem;">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(() => {
                        const allHistory = [];
                        workers.forEach(w => {
                            if (w.paymentHistory) {
                                w.paymentHistory.forEach(ph => {
                                    if (ph.type !== 'Withdrawal') { // Admin only shows sent history
                                        allHistory.push({ ...ph, workerName: w.name, workerId: w.id });
                                    }
                                });
                            }
                        });
                        allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

                        return allHistory.length > 0
                            ? allHistory.map(ph => `
                                                    <tr style="border-bottom: 1px solid var(--border);">
                                                        <td style="padding: 1rem;">${new Date(ph.date).toLocaleString()}</td>
                                                        <td style="padding: 1rem;">${ph.workerName} (${ph.workerId})</td>
                                                        <td style="padding: 1rem; color: var(--success); font-weight: bold;">+${ph.amount} BDT</td>
                                                        <td style="padding: 1rem;">${ph.type}</td>
                                                    </tr>
                                                `).join('')
                            : '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payment history found.</td></tr>';
                    })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

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
                                 ${UI.Input({ label: 'Personal Rating (0-10)', id: 'w-rating', type: 'number', required: true, placeholder: '0-10', min: '0', max: '10' })}
                                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                                    ${UI.Button({ text: 'Add Worker', type: 'submit', variant: 'primary' })}
                                </div>
                            </form>
                        `
                    })}
                `;
            },
            afterRender() {
                const modal = document.getElementById('add-worker-modal');
                document.getElementById('add-worker-btn').addEventListener('click', () => { modal.classList.remove('hidden'); document.getElementById('add-worker-form').reset(); });
                // We handle close button in inline HTML of modal for simplicity or standard listener

                document.getElementById('logout-btn').addEventListener('click', () => { AppContext.clearSession(); Router.navigate('/admin_login'); });

                document.getElementById('backup-btn').addEventListener('click', async () => {
                    const btn = document.getElementById('backup-btn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = 'Generating...';

                    const state = AppContext.state;
                    const date = new Date().toLocaleDateString('en-US');

                    try {
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const margin = 15;
                        let y = 25;

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

                        // 2. Summary Boxes (Total, Active, Avg Score)
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
                        pdf.rect(margin, y, 180 - (margin / 2), 10, 'F');

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
                        state.workers.forEach((w, i) => {
                            if (y > 275) {
                                pdf.addPage();
                                y = 20;
                            }

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
                            const fitness = Utils.getFitnessLevel(w.totalScore);
                            pdf.text(fitness.label, colX[3], y + 6);

                            pdf.text(Utils.formatDate(w.createdAt), colX[4], y + 6);

                            y += 10;
                            pdf.line(margin, y, 195 - margin, y);
                        });

                        pdf.save(`Construction_Backup_${new Date().toISOString().split('T')[0]}.pdf`);
                    } catch (err) {
                        console.error(err);
                        alert('Backup failed: ' + err.message);
                    } finally {
                        btn.innerHTML = originalText;
                    }
                });

                document.getElementById('add-worker-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('w-name').value;
                    const height = parseFloat(document.getElementById('w-height').value);
                    const weight = parseFloat(document.getElementById('w-weight').value);
                    const dob = document.getElementById('w-dob').value;
                    const experience = parseFloat(document.getElementById('w-exp').value);
                    const rating = parseFloat(document.getElementById('w-rating').value);

                    if (isNaN(rating) || rating < 0 || rating > 10) {
                        alert("Error: Personal Rating must be a number between 0 and 10.");
                        return;
                    }

                    const age = Utils.calculateAge(dob);
                    const id = 'W' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const scoreData = Utils.calculateScore({ height, weight, age, experience, rating });

                    AppContext.addWorker({
                        id, name, height, weight, dob, experience, rating,
                        totalScore: scoreData.total,
                        reports: [],
                        status: 'Pending',
                        balance: 0,
                        paymentHistory: [],
                        createdAt: new Date().toISOString()
                    });

                    modal.classList.add('hidden');
                    Router.handleRoute();
                });
                document.getElementById('sort-field').addEventListener('change', (e) => {
                    AppContext.state.sortField = e.target.value;
                    AppContext.save();
                    Router.handleRoute();
                });

                document.getElementById('sort-order').addEventListener('change', (e) => {
                    AppContext.state.sortOrder = e.target.value;
                    AppContext.save();
                    Router.handleRoute();
                });
            }
        },

        WorkerResults: {
            async render() {
                let workerId = null;
                // Parse Query: #/worker_results?id=123
                const rawHash = window.location.hash.split('?');
                if (rawHash[1]) {
                    workerId = new URLSearchParams(rawHash[1]).get('id');
                }
                if (!workerId && AppContext.currentUser) workerId = AppContext.currentUser.id;

                if (!workerId) { Router.navigate('/'); return ''; }

                const worker = AppContext.getWorker(workerId);
                if (!worker) { alert('Worker not found'); Router.navigate('/'); return ''; }

                const isAdmin = AppContext.currentUser && AppContext.currentUser.role === 'admin';
                const fitness = Utils.getFitnessLevel(worker.totalScore);
                const bmi = worker.weight / ((worker.height / 100) ** 2);
                const strikes = worker.strikes || 0;

                // Strike Toggle Logic (Exposed for inline onclick)
                window.updateWorkerStrikes = (targetStrikes) => {
                    const currentStrikes = worker.strikes || 0;
                    const newStrikes = (currentStrikes === targetStrikes) ? targetStrikes - 1 : targetStrikes;
                    AppContext.updateWorker(worker.id, { strikes: newStrikes });
                    // No need to reload, AppContext.updateWorker saves and Router handles re-rendering if needed, 
                    // but for this simple app, we might need to manually trigger re-render or reload.
                    // Since updateWorker modifies the reference in memory, re-calling render is best.
                    Router.handleRoute();
                };

                // BMI Routine Logic
                const getRoutine = (bmi) => {
                    let food = "";
                    let exercise = "";
                    let health = "";

                    if (bmi <= 15.9) {
                        food = "Eat high-calorie meals with large portions of rice or roti, dal, eggs, milk, fish, or meat. Include healthy fats such as cooking oil or ghee. Take frequent snacks like nuts or yogurt between meals.";
                        exercise = "Perform light mobility exercises for 10–15 minutes, including gentle stretching of back, shoulders, and legs. Avoid heavy workouts beyond normal construction tasks.";
                        health = "Stay well hydrated, rest adequately, and monitor for fatigue or dizziness. Consult a doctor if persistent weakness occurs.";
                    } else if (bmi < 17.0) { // 16.0 - 16.9
                        food = "Eat calorie-rich meals with consistent protein sources in every meal (eggs, chickpeas, chicken). Include fruits and vegetables for micronutrients. Do not skip breakfast.";
                        exercise = "Do light strength exercises like slow squats, wall push-ups, or planks for 10–15 minutes. Continue normal construction work.";
                        health = "Drink plenty of water, take breaks in hot weather, and monitor muscle fatigue. Sleep at least 7–8 hours nightly.";
                    } else if (bmi < 18.0) { // 17.0 - 17.9
                        food = "Eat energy-rich meals, including carbohydrates (rice, potatoes), protein (dal, eggs, fish), and moderate healthy fats. Take mid-day snacks such as fruit, boiled eggs, or nuts.";
                        exercise = "Add basic core exercises like planks and bridges for 10–20 minutes alongside normal construction work.";
                        health = "Focus on posture, reduce back strain, and rest adequately after work. Hydrate frequently.";
                    } else if (bmi < 18.5) { // 18.0 - 18.4
                        food = "Eat balanced meals with slightly increased carbohydrate portions to support stamina. Include vegetables and fruits in each meal.";
                        exercise = "Perform strength and core exercises for 15–20 minutes after work to prevent fatigue and injury.";
                        health = "Take short breaks during work for stretching. Maintain hydration and regular sleep.";
                    } else if (bmi < 19.0) { // 18.5 - 18.9
                        food = "Eat balanced meals with rice/roti, vegetables, and a protein source. Include snacks like fruits or yogurt if hungry between meals.";
                        exercise = "Continue normal construction work and add bodyweight strength exercises like push-ups, squats, and planks for 15–20 minutes.";
                        health = "Stretch after work to reduce joint stiffness. Stay hydrated and maintain good sleep hygiene.";
                    } else if (bmi < 19.5) { // 19.0 - 19.4
                        food = "Eat balanced meals with equal portions of carbohydrates, protein, and vegetables. Avoid skipping meals.";
                        exercise = "Perform 15–25 minutes of strength exercises (push-ups, squats, planks) after work.";
                        health = "Take 5–10 minute stretching breaks during work. Monitor hydration and prevent repetitive strain injuries.";
                    } else if (bmi < 20.0) { // 19.5 - 19.9
                        food = "Eat balanced meals with moderate extra protein (add an egg, yogurt, or lentils). Include vegetables and fruits.";
                        exercise = "Do bodyweight strength exercises for 15–25 minutes after construction work. Focus on core, back, and legs.";
                        health = "Practice stretching and mobility exercises daily. Sleep 7–8 hours and hydrate properly.";
                    } else if (bmi < 20.5) { // 20.0 - 20.4
                        food = "Eat balanced meals with a slightly higher protein portion. Include vegetables and whole grains. Avoid sugary drinks and fried snacks.";
                        exercise = "Continue bodyweight strength exercises after work. Include 5–10 minutes of mobility stretches.";
                        health = "Monitor joint comfort and back health. Stay hydrated throughout the workday.";
                    } else if (bmi < 21.0) { // 20.5 - 20.9
                        food = "Eat balanced meals with protein in every meal. Include fruits and vegetables. Limit fried and sugary foods.";
                        exercise = "Perform strength and core exercises for 15–25 minutes after work. Focus on back, legs, and shoulders.";
                        health = "Stretch daily. Ensure adequate sleep and maintain hydration. Avoid overexertion.";
                    } else if (bmi < 21.5) { // 21.0 - 21.4
                        food = "Eat balanced meals, avoid empty calories, include vegetables and protein. Take light snacks if hungry between meals.";
                        exercise = "Do 15–25 minutes of bodyweight strength exercises after work. Include core and back strengthening.";
                        health = "Maintain proper lifting posture. Stretch daily and rest sufficiently.";
                    } else if (bmi < 22.0) { // 21.5 - 21.9
                        food = "Eat balanced meals with moderate protein and vegetables. Avoid sugary drinks.";
                        exercise = "Perform strength and mobility exercises after work. Include squats, push-ups, and planks for 15–20 minutes.";
                        health = "Monitor for fatigue, maintain hydration, and take breaks during work.";
                    } else if (bmi < 22.5) { // 22.0 - 22.4
                        food = "Eat balanced meals with rice/roti, protein, and vegetables. Include fruits and fiber-rich foods.";
                        exercise = "Focus on mobility exercises after work for 10–15 minutes to prevent stiffness. Include light stretching.";
                        health = "Take regular breaks, hydrate well, and avoid prolonged static posture during work.";
                    } else if (bmi < 23.0) { // 22.5 - 22.9
                        food = "Eat balanced meals with moderate carbohydrates and protein. Include vegetables in each meal. Limit sugary foods.";
                        exercise = "Perform mobility and stretching exercises for 10–15 minutes after work. Avoid heavy additional strength exercises.";
                        health = "Monitor joints and back. Maintain hydration and sleep.";
                    } else if (bmi < 23.5) { // 23.0 - 23.4
                        food = "Eat clean home-cooked meals. Avoid fried snacks and sugary drinks. Focus on vegetables, protein, and moderate rice/roti.";
                        exercise = "Do only normal construction work. Add light stretching if muscles feel stiff.";
                        health = "Rest well and hydrate. Avoid overexertion during shifts.";

                    } else if (bmi < 24.0) { // 23.5 - 23.9
                        food = "Continue clean meals with moderate portions. Include fiber and protein in each meal.";
                        exercise = "Rely on normal work for physical activity. Stretching can be added if needed.";
                        health = "Monitor joints, hydration, and energy levels.";
                    } else if (bmi < 24.5) { // 24.0 - 24.4
                        food = "Reduce carbohydrate portions slightly, especially in the evening. Focus on vegetables, protein, and fiber.";
                        exercise = "Do light mobility exercises for 10–15 minutes after work.";
                        health = "Check for early signs of weight gain or joint discomfort. Maintain hydration.";
                    } else if (bmi < 25.0) { // 24.5 - 24.9
                        food = "Continue light carb control and include fiber-rich vegetables. Avoid fried and sugary foods.";
                        exercise = "Do light mobility exercises for 10–15 minutes. Continue normal work.";
                        health = "Monitor knees, back, and joints. Stay hydrated and get adequate rest.";
                    } else if (bmi < 26.0) { // 25.0 - 25.9
                        food = "Eat smaller meals with high protein and fiber. Include vegetables and lean protein in each meal. Avoid excess carbs and fried foods.";
                        exercise = "Add moderate cardio such as brisk walking for 20–30 minutes after work.";
                        health = "Monitor blood pressure and joint stress. Take breaks to avoid fatigue.";
                    } else if (bmi < 27.0) { // 26.0 - 26.9
                        food = "Eat protein and fiber-rich meals. Limit refined carbs and oils. Include fruits and vegetables.";
                        exercise = "Perform 20–30 minutes of moderate cardio in addition to normal work.";
                        health = "Monitor knees, ankles, and joints. Avoid overexertion and stay hydrated.";
                    } else if (bmi < 28.0) { // 27.0 - 27.9
                        food = "Control portion sizes and eat slowly. Include protein, vegetables, and whole grains. Avoid sugary drinks and fried foods.";
                        exercise = "Perform cardio such as brisk walking or cycling for 20–30 minutes. Continue normal work.";
                        health = "Monitor for fatigue and breathlessness. Take short rest breaks during work.";
                    } else if (bmi < 29.0) { // 28.0 - 28.9
                        food = "Eat low-oil, low-sugar meals. Include vegetables, lean protein, and moderate carbs.";
                        exercise = "Perform moderate cardio (walking, cycling) for 20–30 minutes after work.";
                        health = "Pay attention to joint and back strain. Maintain hydration.";
                    } else if (bmi < 30.0) { // 29.0 - 29.9
                        food = "Eat light meals with moderate protein and fiber. Avoid heavy foods and fried snacks.";
                        exercise = "Perform light mobility exercises and stretching for 10–15 minutes. Continue normal work.";
                        health = "Focus on joint comfort and recovery. Stay hydrated and get enough rest.";
                    } else if (bmi < 31.0) { // 30.0 - 30.9
                        food = "Eat light, fiber-rich meals with vegetables and lean protein. Avoid sugary and oily foods.";
                        exercise = "Perform low-impact cardio such as walking for 30 minutes after work. Stretch regularly.";
                        health = "Monitor blood pressure, knees, and back. Avoid overexertion.";
                    } else if (bmi < 33.0) { // 31.0 - 32.9
                        food = "Eat small, frequent meals with high protein and fiber. Include fruits and vegetables. Limit rice/roti portions.";
                        exercise = "Perform steady, low-intensity walking for 30 minutes. Continue mobility exercises.";
                        health = "Avoid sudden or heavy movements. Monitor joints and back.";
                    } else if (bmi < 34.0) { // 33.0 - 33.9
                        food = "Control total calories while keeping meals nutrient-dense. Focus on protein and vegetables.";
                        exercise = "Perform light mobility and stretching exercises only. Avoid heavy cardio.";
                        health = "Monitor fatigue, breathing, and recovery time. Stay hydrated.";
                    } else if (bmi < 35.0) { // 34.0 - 34.9
                        food = "Eat very light, easily digestible meals with high fiber. Include soups, vegetables, and liquid nutrition.";
                        exercise = "Perform stretching and gentle mobility exercises for 10–15 minutes. Avoid cardio.";
                        health = "Focus on reducing strain, preventing injuries, and hydration.";
                    } else if (bmi < 37.0) { // 35.0 - 36.9
                        food = "Follow a medical-aware diet: low salt, low sugar, and moderate protein/fiber.";
                        exercise = "Perform gentle walking and light mobility exercises only.";
                        health = "Monitor blood pressure, heart rate, joints, and back. Consult a medical professional regularly.";
                    } else if (bmi < 40.0) { // 37.0 - 39.9
                        food = "Eat under supervision with controlled calories, focusing on high fiber, lean protein, and vegetables.";
                        exercise = "Limit physical activity to very light movements and stretching. Avoid cardio and strenuous tasks.";
                        health = "Continuous monitoring of blood pressure, joints, heart, and back. Avoid overexertion.";
                    } else { // >= 40.0
                        food = "Follow strict medical supervision with individualized diet plans, emphasizing low salt, low sugar, and nutrient-dense meals.";
                        exercise = "Only perform medical-guided activities approved by a doctor. Avoid normal construction work if unsafe.";
                        health = "Continuous health monitoring for cardiovascular, metabolic, and musculoskeletal risks.";
                    }

                    return { food, exercise, health };
                };

                const routine = getRoutine(bmi);

                // Chat Modal HTML
                const renderChatModal = () => UI.Modal({
                    id: 'chat-modal',
                    title: 'Report Discussion',
                    children: `
                        <div id="chat-container">
                            <div id="chat-messages" style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 0.5rem; border: 1px solid var(--border);">
                                <!-- Messages Rendered Here -->
                            </div>
                            <div id="chat-controls">
                                <textarea id="chat-input" rows="2" placeholder="Type your message..." style="width:100%; margin-bottom:0.5rem; padding:0.5rem; border-radius:0.5rem; border:1px solid var(--border); background:var(--bg-main); color:var(--text-main);"></textarea>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div id="chat-status-msg" style="font-size:0.8rem; color:var(--text-muted); font-style:italic;"></div>
                                    <div style="display:flex; gap:0.5rem;">
                                        ${UI.Button({ text: 'Mark as Viewed', id: 'mark-seen-btn', variant: 'secondary', className: 'hidden' })}
                                        ${UI.Button({ text: 'Send', id: 'send-msg-btn', variant: 'primary' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                });

                return `
                    <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
                         <div style="margin-bottom: 1rem;">
                            ${UI.Button({ text: '← Back', variant: 'secondary', onClick: isAdmin ? "window.location.hash='#/admin_page'" : "window.location.hash='#/'" })}
                        </div>
                        <div id="print-area">
                            <header style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <div>
                                        <h1 style="font-size: 2.5rem;">${worker.name}</h1>
                                        <p style="color: var(--text-muted);">ID: ${worker.id} | Joined: ${Utils.formatDate(worker.createdAt)}</p>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${worker.totalScore || 0}</div>
                                        <div>Total Score</div>
                                        ${isAdmin ? `<div style="margin-top:0.5rem;">${UI.Button({ text: '<i data-lucide="edit"></i> Edit', className: 'btn-sm btn-secondary', id: 'edit-worker-btn' })}</div>` : ''}
                                    </div>
                                </div>
                            </header>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                                ${UI.Card({
                    title: 'Profile Details',
                    children: `
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                            <div><strong>Age:</strong> ${Utils.calculateAge(worker.dob)}</div>
                                            <div><strong>Experience:</strong> ${worker.experience} Years</div>
                                            <div><strong>Height:</strong> ${worker.height} cm</div>
                                            <div><strong>Weight:</strong> ${worker.weight} kg</div>
                                            <div><strong>Status:</strong> <span style="color: ${fitness.color}; font-weight: bold;">${fitness.label}</span></div>
                                            <div><strong>Rating:</strong> ${worker.rating}/10</div>
                                            <div><strong>BMI:</strong> ${bmi.toFixed(1)}</div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                <strong>Strikes:</strong>
                                                <div style="display: flex; gap: 0.25rem;">
                                                    ${[1, 2, 3, 4, 5].map(i => `
                                                        <div 
                                                            onclick="${isAdmin ? `window.updateWorkerStrikes(${i})` : ''}"
                                                            style="
                                                                width: 20px; 
                                                                height: 20px; 
                                                                border-radius: 50%; 
                                                                border: 1px solid ${i <= strikes ? 'var(--danger)' : 'black'}; 
                                                                background: ${i <= strikes ? 'var(--danger)' : 'transparent'};
                                                                cursor: ${isAdmin ? 'pointer' : 'default'};
                                                                transition: all 0.2s;
                                                            "
                                                            title="${isAdmin ? 'Toggle Strike' : 'Strikes'}"
                                                        ></div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    `
                })}        ${UI.Card({
                    title: 'Recommended Routine',
                    children: `
                                        <div style="margin-bottom:0.75rem;"><strong style="color:var(--success)">Food:</strong> ${routine.food}</div>
                                        <div style="margin-bottom:0.75rem;"><strong style="color:var(--accent)">Exercise:</strong> ${routine.exercise}</div>
                                        <div><strong style="color:var(--warning)">Health:</strong> ${routine.health}</div>
                                    `
                })}
                            </div>

                            </div>
                            <div style="margin-bottom: 2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <h2>Reports History</h2>
                                    <div style="display: flex; gap: 0.5rem;">
                                         ${UI.Button({ text: '<i data-lucide="banknote"></i> Claim Payment', id: 'claim-payment-btn', variant: 'success', onClick: "window.location.hash='/worker_results/payment'" })}
                                         ${UI.Button({ text: '<i data-lucide="file-text"></i> Report', id: 'new-report-btn', variant: 'primary' })}
                                    </div>
                                </div>
                                <div class="glass-card" style="padding: 1rem;">
                                    ${worker.reports && worker.reports.length > 0
                        ? worker.reports.map((r, idx) => `
                                            <div style="border-bottom:1px solid var(--border); padding:1rem 0;">
                                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                                    <div style="flex: 1;">
                                                        <strong>${r.date}</strong> (${r.author})
                                                        <p style="margin-bottom:0.5rem;">${r.content}</p>
                                                        ${r.messages && r.messages.length > 0 ? `<div style="font-size:0.85rem; color:var(--text-muted);"><i data-lucide="message-square"></i> ${r.messages.length} comments</div>` : ''}
                                                    </div>
                                                    ${UI.Button({ text: 'Discussion', className: 'btn-sm btn-secondary', onClick: `window.openChatModal(${idx})` })}
                                                </div>
                                            </div>`).join('')
                        : 'No reports.'}
                                </div>
                            </div>

                            <div style="margin-bottom: 2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <h2>Transaction History</h2>
                                    ${isAdmin ? UI.Button({ text: 'Clear History', className: 'btn-sm btn-danger', onClick: `window.clearWorkerHistory('${worker.id}')` }) : ''}
                                </div>
                                <div class="glass-card" style="margin-top: 1rem; padding: 0; overflow: hidden;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background: rgba(255,255,255,0.05); text-align: left; border-bottom: 1px solid var(--border);">
                                                <th style="padding: 1rem;">Date</th>
                                                <th style="padding: 1rem;">Amount</th>
                                                <th style="padding: 1rem;">Type</th>
                                                <th style="padding: 1rem;">Status/Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${worker.paymentHistory && worker.paymentHistory.length > 0
                        ? [...worker.paymentHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map(ph => `
                                                    <tr style="border-bottom: 1px solid var(--border);">
                                                        <td style="padding: 1rem;">${new Date(ph.date).toLocaleString()}</td>
                                                        <td style="padding: 1rem; font-weight: bold; color: ${ph.type === 'Withdrawal' ? 'var(--danger)' : 'var(--success)'}">
                                                            ${ph.type === 'Withdrawal' ? '-' : '+'}${ph.amount} BDT
                                                        </td>
                                                        <td style="padding: 1rem;">${ph.type}</td>
                                                        <td style="padding: 1rem;">
                                                            ${ph.status} ${ph.method ? `(${ph.method}: ${ph.number})` : ''}
                                                        </td>
                                                    </tr>
                                                `).join('')
                        : '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-muted);">No transactions yet.</td></tr>'
                    }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                        <div style="text-align:center;">${UI.Button({ text: 'Download PDF', id: 'pdf-btn', variant: 'secondary' })}</div>
                    </div>
                <!-- Report Modal -->
        ${UI.Modal({
                        id: 'report-modal',
                        title: 'New Report',
                        children: `
                            <form id="report-form">
                                <textarea id="report-content" rows="5" required style="width:100%; padding:0.5rem; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border);"></textarea>
                                <div style="margin-top:1rem; text-align:right;">${UI.Button({ text: 'Submit', type: 'submit' })}</div>
                            </form>
                        `
                    })
                    }

                    ${renderChatModal()}

                <!-- Edit Worker Modal (Admin Only) -->
        ${isAdmin ? UI.Modal({
                        id: 'edit-worker-modal',
                        title: 'Edit Worker Details',
                        children: `
                            <form id="edit-worker-form">
                                ${UI.Input({ label: 'Full Name', id: 'e-name', required: true })}
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    ${UI.Input({ label: 'Height (cm)', id: 'e-height', type: 'number', required: true })}
                                    ${UI.Input({ label: 'Weight (kg)', id: 'e-weight', type: 'number', required: true })}
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    ${UI.Input({ label: 'Date of Birth', id: 'e-dob', type: 'date', required: true })}
                                    ${UI.Input({ label: 'Experience (Years)', id: 'e-exp', type: 'number', required: true })}
                                </div>
                                ${UI.Input({ label: 'Personal Rating (0-10)', id: 'e-rating', type: 'number', required: true })}
                                <div style="margin-top: 1.5rem; text-align: right;">
                                    ${UI.Button({ text: 'Save Changes', type: 'submit', variant: 'primary' })}
                                </div>
                            </form>
                        `
                    }) : ''
                    }
    `;
            },
            afterRender() {
                const isAdmin = AppContext.currentUser && AppContext.currentUser.role === 'admin';
                let workerId = new URLSearchParams(window.location.hash.split('?')[1]).get('id');
                if (!workerId && AppContext.currentUser) workerId = AppContext.currentUser.id;
                const worker = AppContext.getWorker(workerId);

                // Edit Logic
                if (isAdmin && worker) {
                    const editModal = document.getElementById('edit-worker-modal');
                    const editBtn = document.getElementById('edit-worker-btn');

                    if (editBtn) {
                        editBtn.addEventListener('click', () => {
                            document.getElementById('e-name').value = worker.name;
                            document.getElementById('e-height').value = worker.height;
                            document.getElementById('e-weight').value = worker.weight;
                            document.getElementById('e-dob').value = worker.dob;
                            document.getElementById('e-exp').value = worker.experience;
                            document.getElementById('e-rating').value = worker.rating;
                            editModal.classList.remove('hidden');
                        });
                    }

                    const editForm = document.getElementById('edit-worker-form');
                    if (editForm) {
                        editForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const height = parseFloat(document.getElementById('e-height').value);
                            const weight = parseFloat(document.getElementById('e-weight').value);
                            const dob = document.getElementById('e-dob').value;
                            const experience = parseFloat(document.getElementById('e-exp').value);
                            const rating = parseFloat(document.getElementById('e-rating').value);

                            const age = Utils.calculateAge(dob);
                            const scoreData = Utils.calculateScore({ height, weight, age, experience, rating });

                            AppContext.updateWorker(worker.id, {
                                name: document.getElementById('e-name').value,
                                height, weight, dob, experience, rating,
                                totalScore: scoreData.total
                            });

                            editModal.classList.add('hidden');
                            Router.handleRoute();
                        });
                    }
                }

                // New Report Logic
                const modal = document.getElementById('report-modal');
                const newReportBtn = document.getElementById('new-report-btn');
                if (newReportBtn) {
                    newReportBtn.addEventListener('click', () => modal.classList.remove('hidden'));
                }

                const reportForm = document.getElementById('report-form');
                if (reportForm) {
                    reportForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const workerId = new URLSearchParams(window.location.hash.split('?')[1]).get('id') || (AppContext.currentUser ? AppContext.currentUser.id : null);
                        if (workerId) {
                            const content = document.getElementById('report-content').value;
                            const worker = AppContext.getWorker(workerId);
                            worker.reports.unshift({
                                date: new Date().toLocaleDateString(),
                                content,
                                author: isAdmin ? 'Manager' : 'Worker',
                                complaint: null
                            });
                            worker.status = 'Active';
                            AppContext.save();
                            modal.classList.add('hidden');
                            Router.handleRoute();
                        }
                    });
                }
                // Chat Modal Logic
                let currentReportIdx = null;

                window.openChatModal = (idx) => {
                    const worker = AppContext.getWorker(workerId); // Refresh reference
                    if (!worker) return;

                    currentReportIdx = idx;
                    const report = worker.reports[idx];

                    const role = isAdmin ? 'admin' : 'worker';

                    // Render Messages
                    const msgContainer = document.getElementById('chat-messages');
                    msgContainer.innerHTML = '';

                    if (report.messages) {
                        report.messages.forEach((msg, mIdx) => {
                            const isMe = msg.sender === role;
                            const div = document.createElement('div');
                            div.style.marginBottom = '0.5rem';
                            div.style.textAlign = isMe ? 'right' : 'left';

                            // Edit Button?
                            let editBtn = '';
                            if (AppContext.canEditMessage(msg, role)) {
                                editBtn = `<button class="btn-xs btn-link" onclick="window.editChatMsg(${mIdx})">Edit</button>`;
                            }

                            const bg = isMe ? 'var(--primary)' : 'var(--bg-card-hover)';
                            const color = isMe ? '#fff' : 'var(--text-main)';
                            const seen = msg.seenAt ? '<i data-lucide="check-check" size="14"></i>' : '';

                            div.innerHTML = `
                                <div style="display:inline-block; max-width:80%; padding:0.5rem 1rem; border-radius:1rem; background:${bg}; color:${color}; text-align:left;">
                                    ${msg.content}
                                    <div style="font-size:0.7rem; opacity:0.75; margin-top:0.2rem; display:flex; justify-content:space-between; gap:0.5rem;">
                                        <span>${Utils.formatDate(msg.timestamp)} ${editBtn}</span>
                                        <span>${seen}</span>
                                    </div>
                                </div>
                            `;
                            msgContainer.appendChild(div);
                        });
                    }

                    // Update Controls
                    const canSend = AppContext.canSendMessage(report, role);
                    const input = document.getElementById('chat-input');
                    const sendBtn = document.getElementById('send-msg-btn');
                    const statusMsg = document.getElementById('chat-status-msg');
                    const markSeenBtn = document.getElementById('mark-seen-btn');

                    // Reset
                    markSeenBtn.classList.add('hidden');

                    // Check if can mark as seen
                    if (report.messages && report.messages.length > 0) {
                        const lastMsg = report.messages[report.messages.length - 1];
                        if (lastMsg.sender !== role && !lastMsg.seenAt) {
                            markSeenBtn.classList.remove('hidden');
                            markSeenBtn.onclick = () => {
                                AppContext.markLastMessageSeen(workerId, currentReportIdx, role);
                                window.openChatModal(currentReportIdx); // Re-render
                            };
                        }
                    }

                    if (canSend) {
                        input.disabled = false;
                        sendBtn.disabled = false;
                        sendBtn.style.opacity = '1';
                        statusMsg.textContent = '';
                        input.placeholder = "Type your message...";
                    } else {
                        input.disabled = true;
                        sendBtn.disabled = true;
                        sendBtn.style.opacity = '0.5';
                        statusMsg.textContent = "Waiting for other party to reply or view...";
                        input.placeholder = "Locked.";
                    }

                    // Scroll to bottom
                    msgContainer.scrollTop = msgContainer.scrollHeight;
                    document.getElementById('chat-modal').classList.remove('hidden');
                    Utils.initIcons();
                };

                // Send Handler
                document.getElementById('send-msg-btn').onclick = () => {
                    const input = document.getElementById('chat-input');
                    const content = input.value.trim();
                    if (content) {
                        const role = isAdmin ? 'admin' : 'worker';
                        AppContext.addMessage(workerId, currentReportIdx, content, role);
                        input.value = '';
                        window.openChatModal(currentReportIdx); // Re-render
                    }
                };

                // Edit Handler (Global for inline click)
                window.editChatMsg = (mIdx) => {
                    const newContent = prompt("Edit your message:");
                    if (newContent !== null) {
                        const role = isAdmin ? 'admin' : 'worker';
                        // Security check handled in backend mostly, but valid here too
                        AppContext.editMessage(workerId, currentReportIdx, mIdx, newContent);
                        window.openChatModal(currentReportIdx);
                    }
                };

                document.getElementById('pdf-btn').addEventListener('click', async () => {
                    // Calculate BMI and routine here, as they are used in the new PDF generation logic
                    const bmi = worker.weight / ((worker.height / 100) ** 2);
                    const routine = Utils.generateRoutine(worker.totalScore);

                    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                    const margin = 25.4; // 1 inch
                    let y = 30;

                    // Header
                    pdf.setFontSize(24);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor('#1e293b');
                    pdf.text(worker.name, margin, y);
                    y += 10;

                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor('#64748b');
                    pdf.text(`ID: ${worker.id} | Joined: ${Utils.formatDate(worker.createdAt)}`, margin, y);
                    y += 5;

                    // Score
                    pdf.setFontSize(16);
                    pdf.setTextColor('#3b82f6');
                    pdf.text(`Total Score: ${worker.totalScore || 0}`, 150, 30);

                    y += 15;
                    pdf.setDrawColor(59, 130, 246);
                    pdf.line(margin, y, 185, y);
                    y += 10;

                    // Metrics
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor('#1e293b');
                    pdf.text("Worker Profile Metrics", margin, y);
                    y += 10;

                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');
                    const metrics = [
                        `Age: ${Utils.calculateAge(worker.dob)}`,
                        `Experience: ${worker.experience} Yrs`,
                        `Height: ${worker.height} cm`,
                        `Weight: ${worker.weight} kg`,
                        `Fitness: ${Utils.getFitnessLevel(worker.totalScore).label}`,
                        `Rating: ${worker.rating}/10`,
                        `BMI: ${bmi.toFixed(1)}`,
                        `Strikes: ${worker.strikes || 0}`
                    ];

                    let mx = margin;
                    metrics.forEach((m, i) => {
                        pdf.text(m, mx, y);
                        mx += 45;
                        if ((i + 1) % 4 === 0) { mx = margin; y += 8; }
                    });

                    y += 15;
                    // Routine
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text("Recommended Routine", margin, y);
                    y += 8;
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');

                    const foodLines = pdf.splitTextToSize(`Diet: ${routine.food}`, 160);
                    pdf.text(foodLines, margin, y);
                    y += (foodLines.length * 5) + 3;

                    const exLines = pdf.splitTextToSize(`Exercise: ${routine.exercise}`, 160);
                    pdf.text(exLines, margin, y);
                    y += (exLines.length * 5) + 3;

                    // History
                    y += 10;
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text("Reports History", margin, y);
                    y += 8;
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');

                    if (worker.reports && worker.reports.length > 0) {
                        worker.reports.forEach(r => {
                            const rLines = pdf.splitTextToSize(`${r.date} (${r.author}): ${r.content}`, 165);
                            if (y + (rLines.length * 5) > 270) { pdf.addPage(); y = 25; }
                            pdf.text(rLines, margin, y);
                            y += (rLines.length * 5) + 3;
                        });
                    } else {
                        pdf.text("No reports found.", margin, y);
                    }

                    pdf.save(`Worker_Report_${worker.id}_${new Date().toISOString().split('T')[0]}.pdf`);
                });
            },
        },

        AdminAI: {
            async render() {
                if (!AppContext.currentUser || AppContext.currentUser.role !== 'admin') {
                    Router.navigate('/admin_login');
                    return '';
                }
                return `
                    <div class="container flex-center" style="min-height: 100vh;">
                        <div style="max-width: 800px; width: 100%; height: 85vh; display: flex; flex-direction: column;">
                            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                ${UI.Button({ text: '← Back to Dashboard', variant: 'secondary', onClick: "window.location.hash='/admin_page'" })}
                                <h2 style="margin: 0;">Admin Intelligence</h2>
                                <div style="width: 100px;"></div>
                            </div>
                            <div class="glass-card" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
                                <div id="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                                    <div style="align-self: flex-start; max-width: 80%; padding: 1rem; border-radius: 1rem; background: var(--bg-card-hover); border: 1px solid var(--border);">
                                        Hello, Administrator. I have analyzed the entire worker database. I am ready to provide insights, summaries, and strategic recommendations based on the current workforce data. How can I assist you?
                                    </div>
                                </div>
                                <div style="padding: 1rem; border-top: 1px solid var(--border); background: var(--bg-card);">
                                    <form id="ai-chat-form" style="display: flex; gap: 0.5rem; align-items: flex-end;">
                                        <textarea id="ai-input" placeholder="Ask about worker stats, risks, or efficiency..." rows="1" style="flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-main); resize: none; min-height: 44px; max-height: 150px; overflow-y: auto; font-family: inherit;"></textarea>
                                        <button type="submit" class="btn btn-primary" style="height: 44px; width: 44px; display: flex; align-items: center; justify-content: center;"><i data-lucide="send"></i></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },
            afterRender() {
                const messagesContainer = document.getElementById('ai-chat-messages');
                const form = document.getElementById('ai-chat-form');
                const input = document.getElementById('ai-input');

                // Auto-resize
                input.addEventListener('input', function () {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                    if (this.value === '') this.style.height = '44px';
                });

                // Enter to submit
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        form.dispatchEvent(new Event('submit'));
                    }
                });

                const formatMarkdown = (text) => {
                    if (window.marked && window.marked.parse) {
                        return window.marked.parse(text);
                    }
                    // Fallback
                    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^\s*\*\s+(.*)/gm, '<li>$1</li>')
                        .replace(/\n/g, '<br>');
                };

                const appendMessage = (role, text) => {
                    const div = document.createElement('div');
                    const isUser = role === 'user';
                    div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
                    div.style.maxWidth = '85%';
                    div.style.padding = '1rem';
                    div.style.borderRadius = '1rem';
                    div.style.background = isUser ? 'var(--primary)' : 'rgba(255,255,255,0.05)';
                    div.style.color = isUser ? '#fff' : 'var(--text-main)';
                    div.style.border = isUser ? 'none' : '1px solid var(--border)';
                    div.style.whiteSpace = 'normal';
                    div.style.wordBreak = 'break-word';

                    if (!isUser) {
                        div.classList.add('ai-response');
                        div.innerHTML = formatMarkdown(text);
                        // Apply additional styles for tables usually found in ai.html
                    } else {
                        div.textContent = text;
                    }

                    messagesContainer.appendChild(div);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                };

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const query = input.value.trim();
                    if (!query) return;

                    appendMessage('user', query);
                    input.value = '';
                    input.style.height = '44px';

                    const loadingDiv = document.createElement('div');
                    loadingDiv.innerHTML = '<div style="display:flex; align-items:center; gap:0.5rem;"><div class="spinner"></div><em>Analyzing Workforce Data...</em></div>';
                    loadingDiv.style.color = 'var(--text-muted)';
                    loadingDiv.style.alignSelf = 'flex-start';
                    loadingDiv.style.padding = '0.5rem 1rem';
                    loadingDiv.style.fontSize = '0.9rem';
                    messagesContainer.appendChild(loadingDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    try {
                        const dbContext = JSON.stringify(AppContext.state, null, 2);

                        const adminContext = `ADMIN CONTEXT & DATA ANALYSIS:
You are currently providing intelligence to the CONSTRUCTION MANAGER (Admin). You have access to the real-time Worker Database below. Treat this as your "live situational memory" to provide data-driven insights.

DATABASE:
${dbContext}

YOUR MISSION:
1. Analyze the DATABASE to answer questions about specific workers (lookup IDs), total stats, fitness trends, and financial risks.
2. Provide technical construction advice as "normal" as the worker AI, but with the added context of this specific project's data.
3. If asked about workforce efficiency, use the ratings and strikes in the data to justify your PhD-level reasoning.
4. Combine structural engineering/safety principles with the actual metrics of the workers currently on site.`;

                        const response = await fetch('/api/ai', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: adminContext + "\n\nAdmin Search/Query: " + query })
                        });

                        const data = await response.json();
                        loadingDiv.remove();

                        if (data.reply) {
                            appendMessage('model', data.reply);
                        } else if (data.error) {
                            appendMessage('model', "Error: " + data.error);
                        } else {
                            appendMessage('model', "I apologize, Administrator. I encountered an error while processing the database query. Please ensure connectivity and try again.");
                        }
                    } catch (err) {
                        loadingDiv.remove();
                        appendMessage('model', "Connection Error: Failed to reach the Intelligence Server. Description: " + err.message);
                    }
                });

                // Focus
                input.focus();
            }
        },

        AdminPayment: {
            render() {
                const workers = AppContext.state.workers;

                window.calculatePayment = (idx) => {
                    const salary = parseFloat(document.getElementById(`salary-${idx}`).value) || 0;
                    const bonus = parseFloat(document.getElementById(`bonus-${idx}`).value) || 0;
                    const strikes = workers[idx].strikes || 0;

                    const strikePenalty = strikes * 25;
                    const autoBonus = strikes === 0 ? 25 : 0;

                    const total = Math.max(0, salary + bonus - strikePenalty + autoBonus);
                    document.getElementById(`total-${idx}`).innerText = total.toFixed(2) + ' BDT';
                    return total;
                };

                window.sendPayment = (idx) => {
                    const amount = window.calculatePayment(idx);
                    if (amount > 0) {
                        const w = workers[idx];
                        w.balance = (w.balance || 0) + amount;
                        w.paymentHistory = w.paymentHistory || [];
                        w.paymentHistory.push({
                            date: new Date().toISOString(),
                            amount: amount,
                            type: 'Salary+Bonus',
                            status: 'Pending Claim'
                        });
                        AppContext.save();
                        alert(`Successfully added ${amount} BDT to ${w.name}'s balance.`);
                        Router.handleRoute();
                    } else {
                        alert("Total amount must be greater than 0 for " + workers[idx].name);
                    }
                };

                window.applyBulkAmounts = () => {
                    const bulkSalary = parseFloat(document.getElementById('bulk-salary').value) || 0;
                    const bulkBonus = parseFloat(document.getElementById('bulk-bonus').value) || 0;
                    const checkboxes = document.querySelectorAll('.worker-checkbox:checked');

                    if (checkboxes.length === 0) {
                        alert("Please select workers first.");
                        return;
                    }

                    checkboxes.forEach(cb => {
                        const idx = cb.getAttribute('data-index');
                        document.getElementById(`salary-${idx}`).value = bulkSalary;
                        document.getElementById(`bonus-${idx}`).value = bulkBonus;
                        window.calculatePayment(idx);
                    });
                };

                window.sendBulkPayment = () => {
                    const checkboxes = document.querySelectorAll('.worker-checkbox:checked');
                    if (checkboxes.length === 0) {
                        alert("Please select at least one worker.");
                        return;
                    }

                    let processedCount = 0;
                    let totalAmount = 0;

                    checkboxes.forEach(cb => {
                        const idx = parseInt(cb.getAttribute('data-index'));
                        const amount = window.calculatePayment(idx);
                        if (amount > 0) {
                            const w = workers[idx];
                            w.balance = (w.balance || 0) + amount;
                            w.paymentHistory = w.paymentHistory || [];
                            w.paymentHistory.push({
                                date: new Date().toISOString(),
                                amount: amount,
                                type: 'Salary+Bonus',
                                status: 'Pending Claim'
                            });
                            totalAmount += amount;
                            processedCount++;
                        }
                    });

                    if (processedCount > 0) {
                        AppContext.save();
                        alert(`Successfully processed payment for ${processedCount} workers. Total: ${totalAmount.toFixed(2)} BDT`);
                        Router.handleRoute();
                    } else {
                        alert("No valid payments to process (all selected amounts were 0).");
                    }
                };

                return `
                    <div class="container" style="padding-top: 2rem;">
                         <div style="margin-bottom: 1rem;">
                            <button class="btn btn-secondary" onclick="window.location.hash='/admin_page'">← Back</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h1>Distribute Payment</h1>
                                <p style="color:var(--text-muted)">Calculate and send payments to workers.</p>
                            </div>
                            <div>
                                ${UI.Button({ text: 'Pay Selected Workers', id: 'pay-all-btn', variant: 'success', onClick: 'window.sendBulkPayment()' })}
                            </div>
                        </div>
                        
                        <div class="glass-card" style="margin-top: 1.5rem; padding: 1rem; display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 150px;">
                                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Bulk Salary (BDT)</label>
                                <input type="number" id="bulk-salary" placeholder="Amount" style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-main);">
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Bulk Bonus (BDT)</label>
                                <input type="number" id="bulk-bonus" placeholder="Amount" style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-main);">
                            </div>
                            ${UI.Button({ text: 'Apply to Selected', variant: 'secondary', onClick: 'window.applyBulkAmounts()' })}
                        </div>

                        <div class="glass-card" style="margin-top: 1.5rem; overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                                <thead>
                                    <tr style="border-bottom: 1px solid var(--border); text-align: left;">
                                        <th style="padding: 1rem;"><input type="checkbox" id="select-all-workers"></th>
                                        <th style="padding: 1rem;">Worker</th>
                                        <th style="padding: 1rem;">Strikes</th>
                                        <th style="padding: 1rem;">Salary (BDT)</th>
                                        <th style="padding: 1rem;">Bonus (BDT)</th>
                                        <th style="padding: 1rem;">Net Total</th>
                                        <th style="padding: 1rem;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${workers.map((w, i) => {
                    const strikes = w.strikes || 0;
                    return `
                                        <tr style="border-bottom: 1px solid var(--border);">
                                            <td style="padding: 1rem;">
                                                <input type="checkbox" class="worker-checkbox" data-index="${i}">
                                            </td>
                                            <td style="padding: 1rem;">
                                                <strong>${w.name}</strong><br>
                                                <small style="color:var(--text-muted)">${w.id}</small>
                                            </td>
                                            <td style="padding: 1rem; color: var(--danger); font-weight: bold;">
                                                ${strikes}
                                            </td>
                                            <td style="padding: 1rem;">
                                                <input type="number" id="salary-${i}" value="0" min="0" 
                                                    style="padding:0.5rem; width:100px; border-radius:0.5rem; border:1px solid var(--border); background:var(--bg-main); color:var(--text-main);"
                                                    oninput="window.calculatePayment(${i})">
                                            </td>
                                            <td style="padding: 1rem;">
                                                <input type="number" id="bonus-${i}" value="0" min="0" 
                                                    style="padding:0.5rem; width:100px; border-radius:0.5rem; border:1px solid var(--border); background:var(--bg-main); color:var(--text-main);"
                                                    oninput="window.calculatePayment(${i})">
                                            </td>
                                            <td style="padding: 1rem; font-weight: bold; color: var(--success);" id="total-${i}">
                                                ${strikes === 0 ? 25 : -strikes * 25} BDT
                                            </td>
                                            <td style="padding: 1rem;">
                                                <button class="btn btn-primary btn-sm" onclick="window.sendPayment(${i})">Send</button>
                                            </td>
                                        </tr>
                                        `;
                }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            },
            afterRender() {
                // Initialize totals
                const workers = AppContext.state.workers;
                workers.forEach((_, i) => window.calculatePayment(i));

                // Select All Logic
                const selectAll = document.getElementById('select-all-workers');
                const checkboxes = document.querySelectorAll('.worker-checkbox');

                if (selectAll) {
                    selectAll.addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        checkboxes.forEach(cb => {
                            cb.checked = isChecked;
                            // Real-time sync when selecting/deselecting if bulk values exist
                            if (isChecked) window.applyBulkAmounts();
                        });
                    });
                }

                // Real-time Bulk Sync Logic
                const bulkSalaryInput = document.getElementById('bulk-salary');
                const bulkBonusInput = document.getElementById('bulk-bonus');

                if (bulkSalaryInput) {
                    bulkSalaryInput.addEventListener('input', () => window.applyBulkAmounts());
                }
                if (bulkBonusInput) {
                    bulkBonusInput.addEventListener('input', () => window.applyBulkAmounts());
                }
            }
        },

        WorkerPayment: {
            render() {
                const w = AppContext.getWorker(AppContext.currentUser.id);
                if (!w) return '<p>Worker not found.</p>';

                const balance = w.balance || 0;

                return `
                    <div class="container" style="padding-top: 2rem;">
                        <div style="margin-bottom: 1rem;">
                            <button class="btn btn-secondary" onclick="window.location.hash='/worker_results'">← Back</button>
                        </div>
                        <div class="glass-card" style="max-width: 500px; margin: 0 auto; padding: 2rem; text-align: center;">
                            <h2 style="margin-bottom: 0.5rem;">Claim Payment</h2>
                            <p style="color:var(--text-muted); margin-bottom: 2rem;">Withdraw your available earnings.</p>
                            
                            <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-main); border-radius: 1rem; border: 1px solid var(--border);">
                                <div style="font-size: 0.9rem; color: var(--text-muted);">Available Balance</div>
                                <div style="font-size: 3rem; font-weight: 800; color: var(--success); margin: 0.5rem 0;">${balance.toFixed(2)} ৳</div>
                            </div>

                            ${balance > 0 ? `
                                <form id="payment-claim-form" style="text-align: left;">
                                    <div style="margin-bottom: 1rem;">
                                        <label style="display:block; margin-bottom:0.5rem; font-size:0.9rem;">Payment Method</label>
                                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                                            <label class="radio-card">
                                                <input type="radio" name="method" value="Bkash" checked>
                                                <div style="padding:0.5rem; border:1px solid var(--border); border-radius:0.5rem; text-align:center; cursor:pointer;">Bkash</div>
                                            </label>
                                            <label class="radio-card">
                                                <input type="radio" name="method" value="Nagad">
                                                <div style="padding:0.5rem; border:1px solid var(--border); border-radius:0.5rem; text-align:center; cursor:pointer;">Nagad</div>
                                            </label>
                                            <label class="radio-card">
                                                <input type="radio" name="method" value="Rocket">
                                                <div style="padding:0.5rem; border:1px solid var(--border); border-radius:0.5rem; text-align:center; cursor:pointer;">Rocket</div>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    ${UI.Input({ label: 'Mobile Number', id: 'mobile-no', placeholder: '01XXXXXXXXX', required: true })}
                                    
                                    <div style="margin-top: 1.5rem;">
                                        ${UI.Button({ text: 'Confirm Cash Out', type: 'submit', variant: 'primary', className: 'btn-block' })}
                                    </div>
                                </form>
                            ` : `
                                <div style="padding: 2rem; border: 1px dashed var(--border); border-radius: 1rem; color: var(--text-muted);">
                                    No funds available for withdrawal.
                                </div>
                            `}
                        </div>
                    </div>
                `;
            },
            afterRender() {
                const form = document.getElementById('payment-claim-form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const method = document.querySelector('input[name="method"]:checked').value;
                        const number = document.getElementById('mobile-no').value;

                        // Simulate "Processing"
                        const btn = form.querySelector('button[type="submit"]');
                        const originalText = btn.textContent;
                        btn.textContent = 'Processing...';
                        btn.disabled = true;

                        setTimeout(() => {
                            const w = AppContext.getWorker(AppContext.currentUser.id);
                            const amount = w.balance;
                            w.balance = 0; // Reset balance

                            // Log claim (optional)
                            w.paymentHistory = w.paymentHistory || [];
                            w.paymentHistory.push({
                                date: new Date().toISOString(),
                                amount: amount,
                                type: 'Withdrawal',
                                method: method,
                                number: number,
                                status: 'Completed'
                            });

                            AppContext.save();
                            alert(`Payment of ${amount} BDT Successful via ${method} to ${number}!`);
                            Router.handleRoute(); // Refresh
                        }, 2000);
                    });
                }
            }
        },

    };

    // ==========================================
    // 5. Router
    // ==========================================
    const Router = {
        routes: {
            '/': Pages.Home,
            '/admin_login': Pages.AdminLogin,
            '/admin_page': Pages.AdminDashboard,
            '/admin_page/payment': Pages.AdminPayment,
            '/admin_page/ai': Pages.AdminAI,
            '/worker_results': Pages.WorkerResults,
            '/worker_results/payment': Pages.WorkerPayment
        },

        init() {
            window.addEventListener('hashchange', this.handleRoute.bind(this));
            this.handleRoute();
        },

        async handleRoute() {
            let hash = window.location.hash.slice(1) || '/';
            const queryIndex = hash.indexOf('?');
            if (queryIndex !== -1) hash = hash.substring(0, queryIndex);

            const page = this.routes[hash] || Pages.Home;
            const app = document.getElementById('app');
            app.innerHTML = await page.render();
            if (page.afterRender) page.afterRender();
            Utils.initIcons();
        },

        navigate(path) {
            window.location.hash = path;
        }
    };

    // ==========================================
    // 6. Initialization
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        Utils.initTheme();
        AppContext.init();
        Router.init();
        Utils.initIcons();
    });

    window.toggleThemeGlobal = Utils.toggleTheme;

})();
