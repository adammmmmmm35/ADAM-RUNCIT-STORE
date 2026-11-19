function switchAuthTab(tab) {
            const loginForm = document.getElementById('login-form');
            const regForm = document.getElementById('register-form');
            const tabLogin = document.getElementById('auth-tab-login');
            const tabReg = document.getElementById('auth-tab-register');
            const alertBox = document.getElementById('auth-alert');
            alertBox.classList.add('hidden');

            if (tab === 'login') {
                loginForm.classList.remove('hidden');
                regForm.classList.add('hidden');
                tabLogin.className = 'py-2 text-xs font-extrabold rounded-lg bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm transition-all';
                tabReg.className = 'py-2 text-xs font-extrabold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all';
            } else {
                loginForm.classList.add('hidden');
                regForm.classList.remove('hidden');
                tabReg.className = 'py-2 text-xs font-extrabold rounded-lg bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm transition-all';
                tabLogin.className = 'py-2 text-xs font-extrabold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all';
            }
        }

function showAuthAlert(msg, isSuccess) {
            const box = document.getElementById('auth-alert');
            box.textContent = msg;
            box.className = isSuccess
                ? 'mb-4 p-3 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'mb-4 p-3 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30';
            box.classList.remove('hidden');
        }

function fillCreds(u, p) {
            switchAuthTab('login');
            document.getElementById('input-username').value = u;
            document.getElementById('input-password').value = p;
        }

function handleLogin(e) {
            e.preventDefault();
            const identifier = document.getElementById('input-username').value.trim().toLowerCase();
            const password = document.getElementById('input-password').value;

            const found = state.users.find(function(u) {
                return (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) && u.password === password;
            });

            if (!found) {
                showAuthAlert('Invalid username/email or password. Please try again.', false);
                return;
            }

            state.currentUser = found;
            saveState();
            enterWorkspace();
            showToast('Welcome back, ' + found.username + '!');
        }

function handleGoogleSignIn() {
            let googleUser = state.users.find(function(u) { return u.email === 'adam.google@gmail.com'; });
            if (!googleUser) {
                googleUser = {
                    id: 'USR-' + String(state.users.length + 1).padStart(2, '0'),
                    username: 'adam_google',
                    email: 'adam.google@gmail.com',
                    phone: '011-23456789',
                    password: 'google-oauth-user',
                    role: 'customer',
                    address: 'Kuala Lumpur, Malaysia'
                };
                state.users.push(googleUser);
            }
            state.currentUser = googleUser;
            saveState();
            enterWorkspace();
            showToast('Signed in with Google (adam.google@gmail.com)!');
        }

function handleRegister(e) {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value;

            const exists = state.users.some(function(u) {
                return u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase();
            });

            if (exists) {
                showAuthAlert('Username or email is already registered in the system.', false);
                return;
            }

            const newUser = {
                id: 'USR-' + String(state.users.length + 1).padStart(2, '0'),
                username: username,
                email: email,
                phone: phone,
                password: password,
                role: 'customer',
                address: ''
            };

            state.users.push(newUser);
            saveState();

            e.target.reset();
            switchAuthTab('login');
            document.getElementById('input-username').value = username;
            showAuthAlert('Account created and saved permanently! Please sign in now.', true);
            showToast('Account saved to system!');
        }

function handleLogout() {
            state.currentUser = null;
            state.confirmedAddress = null;
            saveState();

            document.getElementById('authenticated-workspace').classList.add('hidden');
            document.getElementById('mobile-sidebar-btn').classList.add('hidden');
            document.getElementById('page-auth').classList.remove('hidden');
            showToast('You have been logged out.');
        }

function enterWorkspace() {
            if (!state.currentUser) return;
            const user = state.currentUser;

            document.getElementById('page-auth').classList.add('hidden');
            document.getElementById('authenticated-workspace').classList.remove('hidden');
            const mobileBtn = document.getElementById('mobile-sidebar-btn');
            if (mobileBtn) {
                mobileBtn.classList.remove('hidden');
                mobileBtn.classList.add('lg:hidden');
            }

            document.getElementById('sidebar-avatar').textContent = user.username.charAt(0).toUpperCase();
            document.getElementById('sidebar-user-name').textContent = user.username;
            document.getElementById('sidebar-user-email').textContent = user.email;
            document.getElementById('sidebar-role-badge').textContent =
                user.role === 'admin' ? 'Administrator Portal' : 'Customer Portal';

            renderSidebarNav();
            populateMalaysiaStates();

            if (user.role === 'admin') {
                navigateTo('admin-dashboard');
            } else {
                document.getElementById('greeting-customer-name').textContent = user.username;
                updateCartBadges();
                navigateTo('customer-catalog');
            }
        }

function renderSidebarNav() {
            const navList = document.getElementById('sidebar-nav-list');
            const isAdmin = state.currentUser && state.currentUser.role === 'admin';

            const menuItems = isAdmin
                ? [
                    { id: 'admin-dashboard', label: 'Business Dashboard', icon: 'fa-chart-line' },
                    { id: 'admin-inventory', label: 'Manage Inventory', icon: 'fa-boxes-stacked' },
                    { id: 'admin-orders', label: 'Customer Orders', icon: 'fa-truck-fast' },
                    { id: 'admin-users', label: 'Registered Users', icon: 'fa-users' }
                ]
                : [
                    { id: 'customer-catalog', label: 'Accessories Store', icon: 'fa-store' },
                    { id: 'customer-cart', label: 'My Cart & Address', icon: 'fa-cart-shopping' },
                    { id: 'customer-orders', label: 'My Orders & Receipts', icon: 'fa-receipt' },
                    { id: 'customer-profile', label: 'My Profile', icon: 'fa-user-gear' }
                ];

            navList.innerHTML = menuItems.map(function(item) {
                return '<button type="button" onclick="navigateTo(\'' + item.id + '\')" data-nav="' + item.id + '"' +
                    ' class="sidebar-nav-item w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">' +
                    '<span class="flex items-center gap-3">' +
                    '<span class="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sky-500">' +
                    '<i class="fa-solid ' + item.icon + ' text-xs"></i>' +
                    '</span>' +
                    '<span>' + item.label + '</span>' +
                    '</span>' +
                    '<i class="fa-solid fa-chevron-right text-[10px] opacity-40"></i>' +
                    '</button>';
            }).join('') +
                '<div class="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">' +
                '<button type="button" onclick="handleLogout()"' +
                ' class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all">' +
                '<span class="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center">' +
                '<i class="fa-solid fa-right-from-bracket text-xs"></i>' +
                '</span>' +
                '<span>Logout Account</span>' +
                '</button>' +
                '</div>';
        }

function navigateTo(pageId) {
            document.querySelectorAll('#authenticated-workspace .page-view').forEach(function(sec) {
                sec.classList.add('hidden');
            });
            const target = document.getElementById('page-' + pageId);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.sidebar-nav-item').forEach(function(btn) {
                if (btn.dataset.nav === pageId) {
                    btn.className = 'sidebar-nav-item w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold bg-sky-600 text-white shadow-md shadow-sky-500/25 transition-all';
                } else {
                    btn.className = 'sidebar-nav-item w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all';
                }
            });

            document.getElementById('left-sidebar').classList.add('-translate-x-full');
            document.getElementById('left-sidebar').classList.remove('phone-open');
            document.getElementById('sidebar-backdrop').classList.add('hidden');
            document.getElementById('sidebar-backdrop').classList.remove('phone-open');

            if (pageId === 'customer-catalog') renderCatalog();
            if (pageId === 'customer-cart') renderCartPage();
            if (pageId === 'customer-orders') renderCustomerOrders();
            if (pageId === 'customer-profile') renderProfilePage();
            if (pageId === 'admin-dashboard') renderAdminDashboard();
            if (pageId === 'admin-inventory') renderAdminInventory();
            if (pageId === 'admin-orders') renderAdminOrders();
            if (pageId === 'admin-users') renderAdminUsers();
        }

function toggleSidebar() {
            const sidebar = document.getElementById('left-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');
            if (document.body.classList.contains('phone-preview-mode')) {
                sidebar.classList.toggle('phone-open');
                backdrop.classList.toggle('phone-open');
            } else {
                sidebar.classList.toggle('-translate-x-full');
                backdrop.classList.toggle('hidden');
            }
        }

function renderProfilePage() {
            const user = state.currentUser;
            if (!user) return;
            document.getElementById('profile-big-avatar').textContent = user.username.charAt(0).toUpperCase();
            document.getElementById('profile-display-name').textContent = user.username;
            document.getElementById('prof-username').value = user.username;
            document.getElementById('prof-phone').value = user.phone || '';
            document.getElementById('prof-email').value = user.email || '';
            document.getElementById('prof-address').value = user.address || '';
        }

function saveProfileChanges(e) {
            e.preventDefault();
            const user = state.currentUser;
            if (!user) return;
            user.phone = document.getElementById('prof-phone').value.trim();
            user.email = document.getElementById('prof-email').value.trim();
            user.address = document.getElementById('prof-address').value.trim();
            const idx = state.users.findIndex(function(u) { return u.username === user.username; });
            if (idx !== -1) state.users[idx] = Object.assign({}, user);
            saveState();
            document.getElementById('sidebar-user-email').textContent = user.email;
            showToast('Profile updated and saved!');
        }