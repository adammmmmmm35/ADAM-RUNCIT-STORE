let toastTimer = null;

function setDisplayMode(mode) {
            const body = document.body;
            const btnDesk = document.getElementById('disp-btn-desktop');
            const btnPhone = document.getElementById('disp-btn-phone');
            const sidebar = document.getElementById('left-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');

            if (mode === 'phone') {
                body.classList.add('phone-preview-mode');
                btnPhone.className = 'px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all bg-sky-600 text-white shadow-sm flex items-center gap-1';
                btnDesk.className = 'px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1';
                if (sidebar) sidebar.classList.remove('phone-open');
                if (backdrop) backdrop.classList.remove('phone-open');
                showToast('Phone display mode enabled (393px)');
            } else {
                body.classList.remove('phone-preview-mode');
                btnDesk.className = 'px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all bg-sky-600 text-white shadow-sm flex items-center gap-1';
                btnPhone.className = 'px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1';
                if (sidebar) sidebar.classList.remove('phone-open');
                if (backdrop) backdrop.classList.remove('phone-open');
                showToast('Desktop display mode enabled');
            }
            if (state.currentUser && state.currentUser.role === 'admin') {
                setTimeout(function() { renderSalesChart(); }, 60);
            }
        }

function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('theme-icon');
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                if (icon) icon.className = 'fa-solid fa-moon';
            } else {
                html.classList.add('dark');
                if (icon) icon.className = 'fa-solid fa-sun';
            }
            if (salesChartInstance || candlestickChartInstance || pyramidChartInstance) {
                renderSalesChart();
            }
        }

function showToast(msg, type) {
            const box = document.getElementById('toast-box');
            const msgEl = document.getElementById('toast-msg');
            if (!box || !msgEl) return;
            msgEl.textContent = msg;
            box.className = type === 'error'
                ? 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2 bg-rose-600 text-white'
                : 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900';
            box.classList.remove('hidden');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function() { box.classList.add('hidden'); }, 3200);
        }

window.addEventListener('DOMContentLoaded', function() {
    state.currentUser = null;
    document.body.classList.remove('phone-preview-mode');
    document.getElementById('authenticated-workspace').classList.add('hidden');
    document.getElementById('page-auth').classList.remove('hidden');
    switchAuthTab('login');
});