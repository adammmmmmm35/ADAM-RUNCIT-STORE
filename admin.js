let pendingAdminCancelOrderId = null;
let pendingShippedOrderId = null;
let pendingRenameProductId = null;
let adminSelectedCategory = 'All';
let adminStockSortMode = 'default';

function renderAdminDashboard() {
            const activeOrders = state.orders.filter(function(o) { return o.status !== 'Cancelled'; });
            const totalRevenue = activeOrders.reduce(function(s, o) { return s + o.total; }, 0);
            const totalStock = state.products.reduce(function(s, p) { return s + p.stock; }, 0);
            document.getElementById('kpi-total-revenue').textContent = 'RM ' + totalRevenue.toFixed(2);
            document.getElementById('kpi-total-orders').textContent = String(activeOrders.length);
            document.getElementById('kpi-total-stock').textContent = String(totalStock);
            document.getElementById('kpi-total-users').textContent = String(state.users.length);
            renderSalesChart();
        }

function setAdminInventoryCategory(category, btnEl) {
            adminSelectedCategory = category;
            document.querySelectorAll('.admin-cat-btn').forEach(function(b) {
                b.className = 'admin-cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
            });
            if (btnEl) btnEl.className = 'admin-cat-btn px-3 py-1.5 rounded-xl text-xs font-extrabold bg-sky-600 text-white';
            renderAdminInventory();
        }

function setAdminStockSort(mode) {
            adminStockSortMode = mode;
            document.querySelectorAll('.stock-sort-btn').forEach(function(b) {
                b.className = 'stock-sort-btn px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-slate-500';
            });
            const activeBtn = document.getElementById('stock-sort-' + mode);
            if (activeBtn) activeBtn.className = 'stock-sort-btn px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-sky-600 text-white';
            renderAdminInventory();
        }

function renderAdminInventory() {
            const tbody = document.getElementById('admin-inventory-tbody');
            if (!tbody) return;
            const searchEl = document.getElementById('admin-inv-search');
            const searchQuery = (searchEl ? searchEl.value : '').trim().toLowerCase();
            let list = state.products.filter(function(p) {
                return (!searchQuery || p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery)) &&
                    (adminSelectedCategory === 'All' || p.category === adminSelectedCategory);
            });
            if (adminStockSortMode === 'highest') list = list.slice().sort(function(a, b) { return b.stock - a.stock; });
            if (adminStockSortMode === 'lowest') list = list.slice().sort(function(a, b) { return a.stock - b.stock; });

            tbody.innerHTML = list.map(function(p) {
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">' +
                    '<td class="py-3 px-4 font-mono font-bold text-slate-400">' + p.id + '</td>' +
                    '<td class="py-3 px-4 font-extrabold">' + p.name + '</td>' +
                    '<td class="py-3 px-4 text-slate-500">' + p.category + '</td>' +
                    '<td class="py-3 px-4 font-bold">RM ' + p.price.toFixed(2) + '</td>' +
                    '<td class="py-3 px-4 font-black ' + (p.stock <= 5 ? 'text-rose-500' : 'text-emerald-500') + '">' + p.stock + '</td>' +
                    '<td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">' +
                    '<button type="button" onclick="adjustStock(\'' + p.id + '\', -1)" class="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 font-black">-</button>' +
                    '<button type="button" onclick="adjustStock(\'' + p.id + '\', 1)" class="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 font-black">+</button>' +
                    '<button type="button" onclick="openRenameProductModal(\'' + p.id + '\')" class="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-500 font-bold">Rename</button>' +
                    '<button type="button" onclick="deleteProduct(\'' + p.id + '\')" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-bold">Delete</button>' +
                    '</td>' +
                    '</tr>';
            }).join('');
        }

function adjustStock(prodId, delta) {
            const p = state.products.find(function(i) { return i.id === prodId; });
            if (p) { p.stock = Math.max(0, p.stock + delta); saveState(); renderAdminInventory(); }
        }

function openRenameProductModal(prodId) {
            const p = state.products.find(function(i) { return i.id === prodId; });
            if (!p) return;
            pendingRenameProductId = prodId;
            document.getElementById('rename-product-input').value = p.name;
            document.getElementById('rename-product-modal').classList.remove('hidden');
        }

function closeRenameProductModal() { document.getElementById('rename-product-modal').classList.add('hidden'); pendingRenameProductId = null; }

function confirmRenameProduct(e) {
            e.preventDefault();
            const p = state.products.find(function(i) { return i.id === pendingRenameProductId; });
            const n = document.getElementById('rename-product-input').value.trim();
            if (p && n) { p.name = n; saveState(); renderAdminInventory(); showToast('Accessory renamed!'); }
            closeRenameProductModal();
        }

function deleteProduct(prodId) { state.products = state.products.filter(function(p) { return p.id !== prodId; }); saveState(); renderAdminInventory(); showToast('Accessory deleted.'); }

function openAddProductModal() { document.getElementById('add-product-modal').classList.remove('hidden'); }

function closeAddProductModal() { document.getElementById('add-product-modal').classList.add('hidden'); }

function handleAddProduct(e) {
            e.preventDefault();
            const name = document.getElementById('new-prod-name').value.trim();
            const category = document.getElementById('new-prod-cat').value;
            const price = parseFloat(document.getElementById('new-prod-price').value);
            const stock = parseInt(document.getElementById('new-prod-stock').value, 10);
            state.products.push({ id: 'P' + String(state.products.length + 1).padStart(2, '0'), name: name, category: category, price: price, stock: stock, icon: 'fa-mobile-screen-button', isElectronic: category === 'Audio' || category === 'Charging' });
            saveState(); e.target.reset(); closeAddProductModal(); renderAdminInventory(); showToast('New accessory added!');
        }

function renderAdminOrders() {
            const list = document.getElementById('admin-orders-list');
            if (!list) return;
            const searchEl = document.getElementById('admin-order-search');
            const filterEl = document.getElementById('admin-order-status-filter');
            const searchQuery = (searchEl ? searchEl.value : '').trim().toLowerCase();
            const statusFilter = filterEl ? filterEl.value : 'All';
            const filtered = state.orders.filter(function(o) {
                return (!searchQuery || o.id.toLowerCase().includes(searchQuery) || o.customer.toLowerCase().includes(searchQuery)) &&
                    (statusFilter === 'All' || o.status === statusFilter);
            });

            list.innerHTML = filtered.map(function(o) {
                const isShipped = o.status === 'Shipped' || o.status === 'Delivered';
                const isCancelled = o.status === 'Cancelled';
                const badgeClass = isCancelled ? 'bg-rose-500/15 text-rose-500' : isShipped ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500';
                const itemsText = o.items.map(function(i) { return i.qty + 'x ' + i.name; }).join(', ');
                return '<div class="admin-order-card bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 overflow-hidden">' +
                    '<div class="space-y-1.5 text-xs min-w-0">' +
                    '<div class="flex flex-wrap items-center gap-2">' +
                    '<span class="font-mono font-black text-sm text-sky-500">' + o.id + '</span>' +
                    '<span class="font-bold text-slate-500">by @' + o.customer + '</span>' +
                    '<span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ' + badgeClass + '">' + o.status + '</span>' +
                    '</div>' +
                    '<p class="text-slate-400 break-words">' + o.date + ' &bull; ' + o.paymentMethod + '</p>' +
                    '<p class="text-slate-600 dark:text-slate-300 font-semibold break-words">' + o.shippingAddress + '</p>' +
                    '<div class="pt-1 text-slate-500 break-words">' + itemsText + '</div>' +
                    (o.cancelReason ? '<p class="text-rose-500 font-bold break-words">Cancel Reason: ' + o.cancelReason + '</p>' : '') +
                    '</div>' +
                    '<div class="admin-order-footer flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-2.5 shrink-0">' +
                    '<span class="text-base font-black">RM ' + o.total.toFixed(2) + '</span>' +
                    '<div class="admin-order-actions flex flex-wrap items-center gap-2">' +
                    (!isShipped && !isCancelled
                        ? '<button type="button" onclick="openAdminShipModal(\'' + o.id + '\')" class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold">Mark Shipped</button>' +
                          '<button type="button" onclick="openAdminCancelModal(\'' + o.id + '\')" class="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-extrabold">Cancel Order</button>'
                        : isShipped ? '<span class="text-[11px] font-extrabold text-sky-500 px-3 py-1.5 rounded-xl bg-sky-500/10">Shipped (Locked)</span>' : '') +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }

function openAdminShipModal(orderId) { pendingShippedOrderId = orderId; document.getElementById('admin-ship-order-label').textContent = orderId; document.getElementById('admin-ship-modal').classList.remove('hidden'); }

function closeAdminShipModal() { document.getElementById('admin-ship-modal').classList.add('hidden'); pendingShippedOrderId = null; }

function confirmMarkShipped() {
            const ord = state.orders.find(function(o) { return o.id === pendingShippedOrderId; });
            if (ord && ord.status === 'Processing') { ord.status = 'Shipped'; saveState(); renderAdminOrders(); showToast('Order ' + ord.id + ' marked as Shipped!'); }
            closeAdminShipModal();
        }

function openAdminCancelModal(orderId) { pendingAdminCancelOrderId = orderId; document.getElementById('admin-cancel-order-label').textContent = orderId; document.getElementById('admin-cancel-modal').classList.remove('hidden'); }

function closeAdminCancelModal() { document.getElementById('admin-cancel-modal').classList.add('hidden'); pendingAdminCancelOrderId = null; }

function confirmAdminCancelOrder() {
            const ord = state.orders.find(function(o) { return o.id === pendingAdminCancelOrderId; });
            if (!ord || ord.status === 'Shipped') { closeAdminCancelModal(); return; }
            ord.status = 'Cancelled';
            ord.cancelReason = 'Admin: ' + document.getElementById('admin-cancel-reason').value;
            ord.items.forEach(function(item) {
                const prod = state.products.find(function(p) { return p.id === item.id; });
                if (prod) prod.stock += item.qty;
            });
            saveState(); closeAdminCancelModal(); renderAdminOrders(); showToast('Order ' + ord.id + ' cancelled & restocked.');
        }

function renderAdminUsers() {
            const tbody = document.getElementById('admin-users-tbody');
            if (!tbody) return;
            const searchEl = document.getElementById('admin-user-search');
            const query = (searchEl ? searchEl.value : '').trim().toLowerCase();
            tbody.innerHTML = state.users.filter(function(u, idx) {
                const uid = (u.id || ('USR-' + String(idx + 1).padStart(2, '0'))).toLowerCase();
                return !query || uid.includes(query) || u.username.toLowerCase().includes(query);
            }).map(function(u, idx) {
                const uid = u.id || ('USR-' + String(idx + 1).padStart(2, '0'));
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">' +
                    '<td class="py-3 px-4 font-mono font-bold text-sky-500">' + uid + '</td>' +
                    '<td class="py-3 px-4 font-extrabold">' + u.username + '</td>' +
                    '<td class="py-3 px-4 text-slate-500">' + u.email + '</td>' +
                    '<td class="py-3 px-4 text-slate-500">' + (u.phone || '-') + '</td>' +
                    '<td class="py-3 px-4"><span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ' + (u.role === 'admin' ? 'bg-indigo-500/15 text-indigo-500' : 'bg-sky-500/15 text-sky-500') + '">' + u.role + '</span></td>' +
                    '</tr>';
            }).join('');
        }