let pendingCartProductId = null;
let pendingQty = 1;
let pendingCustCancelOrderId = null;

function renderCatalog() {
            const grid = document.getElementById('catalog-grid');
            if (!grid) return;
            const searchEl = document.getElementById('catalog-search');
            const catEl = document.getElementById('catalog-category');
            const query = (searchEl ? searchEl.value : '').toLowerCase();
            const cat = catEl ? catEl.value : 'All';

            const filtered = state.products.filter(function(p) {
                const matchText = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
                const matchCat = cat === 'All' || p.category === cat;
                return matchText && matchCat;
            });

            grid.innerHTML = filtered.map(function(p) {
                const outOfStock = p.stock <= 0;
                return '<div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4 hover:border-sky-500/50 transition-all shadow-sm">' +
                    '<div class="space-y-3">' +
                    '<div class="flex items-center justify-between">' +
                    '<span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-500">' + p.category + '</span>' +
                    '<span class="text-[11px] font-bold ' + (outOfStock ? 'text-rose-500' : 'text-slate-400') + '">' + (outOfStock ? 'Out of Stock' : p.stock + ' left') + '</span>' +
                    '</div>' +
                    '<div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-sky-500 text-xl">' +
                    '<i class="fa-solid ' + (p.icon || 'fa-mobile-screen') + '"></i>' +
                    '</div>' +
                    '<h3 class="font-extrabold text-sm leading-snug line-clamp-2">' + p.name + '</h3>' +
                    '</div>' +
                    '<div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">' +
                    '<span class="text-base font-black text-slate-900 dark:text-white">RM ' + p.price.toFixed(2) + '</span>' +
                    '<button type="button" onclick="openQtyModal(\'' + p.id + '\')" ' + (outOfStock ? 'disabled' : '') +
                    ' class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ' + (outOfStock
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20') + '">' +
                    '<i class="fa-solid fa-cart-plus"></i> Add' +
                    '</button>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }

function openQtyModal(productId) {
            const prod = state.products.find(function(p) { return p.id === productId; });
            if (!prod || prod.stock <= 0) return;
            pendingCartProductId = productId;
            pendingQty = 1;
            document.getElementById('qty-modal-cat').textContent = prod.category;
            document.getElementById('qty-modal-name').textContent = prod.name;
            document.getElementById('qty-modal-stock').textContent = 'Available Stock: ' + prod.stock + ' units';
            document.getElementById('qty-modal-val').textContent = '1';
            document.getElementById('qty-modal-subtotal').textContent = 'RM ' + prod.price.toFixed(2);
            document.getElementById('qty-modal').classList.remove('hidden');
        }

function changeModalQty(delta) {
            const prod = state.products.find(function(p) { return p.id === pendingCartProductId; });
            if (!prod) return;
            const next = pendingQty + delta;
            if (next < 1 || next > prod.stock) return;
            pendingQty = next;
            document.getElementById('qty-modal-val').textContent = String(pendingQty);
            document.getElementById('qty-modal-subtotal').textContent = 'RM ' + (prod.price * pendingQty).toFixed(2);
        }

function closeQtyModal() {
            document.getElementById('qty-modal').classList.add('hidden');
            pendingCartProductId = null;
        }

function confirmAddToCart() {
            const prod = state.products.find(function(p) { return p.id === pendingCartProductId; });
            if (!prod) return;
            const existing = state.cart.find(function(item) { return item.id === prod.id; });
            const currentInCart = existing ? existing.qty : 0;
            if (currentInCart + pendingQty > prod.stock) {
                showToast('Cannot exceed available stock (' + prod.stock + ' units).', 'error');
                return;
            }
            if (existing) existing.qty += pendingQty;
            else state.cart.push({ id: prod.id, name: prod.name, category: prod.category, price: prod.price, qty: pendingQty });
            saveState();
            updateCartBadges();
            closeQtyModal();
            showToast('Added ' + pendingQty + 'x ' + prod.name + ' to cart.');
        }

function updateCartBadges() {
            const totalQty = state.cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
            const pill = document.getElementById('catalog-cart-pill');
            if (pill) pill.textContent = String(totalQty);
        }

function populateMalaysiaStates() {
            const sel = document.getElementById('ship-state');
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Select State --</option>' +
                MALAYSIA_STATES.map(function(st) { return '<option value="' + st + '">' + st + '</option>'; }).join('');
        }

function renderCartPage() {
            const container = document.getElementById('cart-page-items');
            if (!container) return;

            if (state.cart.length === 0) {
                container.innerHTML = '<div class="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">' +
                    '<i class="fa-solid fa-cart-arrow-down text-3xl text-slate-400"></i>' +
                    '<p class="font-bold text-sm">Your shopping cart is empty.</p>' +
                    '<button type="button" onclick="navigateTo(\'customer-catalog\')" class="text-xs font-extrabold text-sky-500 hover:underline">Browse iPhone Accessories</button>' +
                    '</div>';
            } else {
                container.innerHTML = state.cart.map(function(item) {
                    return '<div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">' +
                        '<div class="min-w-0 flex-grow">' +
                        '<span class="text-[10px] font-bold text-sky-500 uppercase">' + item.category + '</span>' +
                        '<h4 class="font-extrabold text-xs sm:text-sm truncate">' + item.name + '</h4>' +
                        '<p class="text-xs text-slate-500">RM ' + item.price.toFixed(2) + ' each</p>' +
                        '</div>' +
                        '<div class="flex items-center gap-2 shrink-0">' +
                        '<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">' +
                        '<button type="button" onclick="updateCartItemQty(\'' + item.id + '\', -1)" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 font-black text-xs hover:border-sky-500 border border-transparent transition-colors">-</button>' +
                        '<span class="text-xs font-black w-5 text-center">' + item.qty + '</span>' +
                        '<button type="button" onclick="updateCartItemQty(\'' + item.id + '\', 1)" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 font-black text-xs hover:border-sky-500 border border-transparent transition-colors">+</button>' +
                        '</div>' +
                        '<span class="font-black text-sm text-slate-900 dark:text-white mx-1">RM ' + (item.price * item.qty).toFixed(2) + '</span>' +
                        '<button type="button" onclick="removeCartItem(\'' + item.id + '\')" class="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs transition-colors" title="Remove Item">' +
                        '<i class="fa-solid fa-trash"></i>' +
                        '</button>' +
                        '</div>' +
                        '</div>';
                }).join('');
            }

            const totalItems = state.cart.reduce(function(s, i) { return s + i.qty; }, 0);
            const totalPrice = state.cart.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);

            document.getElementById('summary-item-count').textContent = totalItems + ' item(s)';
            document.getElementById('summary-total-rm').textContent = 'RM ' + totalPrice.toFixed(2);
            updatePaymentButtonState();
        }

function updateCartItemQty(prodId, delta) {
            const cartItem = state.cart.find(function(i) { return i.id === prodId; });
            const prod = state.products.find(function(p) { return p.id === prodId; });
            if (!cartItem) return;

            const nextQty = cartItem.qty + delta;
            if (nextQty <= 0) {
                removeCartItem(prodId);
                return;
            }
            if (prod && nextQty > prod.stock) {
                showToast('Maximum available stock is ' + prod.stock + ' units.', 'error');
                return;
            }

            cartItem.qty = nextQty;
            saveState();
            updateCartBadges();
            renderCartPage();
        }

function removeCartItem(prodId) {
            state.cart = state.cart.filter(function(i) { return i.id !== prodId; });
            saveState();
            updateCartBadges();
            renderCartPage();
        }

function confirmShippingAddress(e) {
            e.preventDefault();
            const street = document.getElementById('ship-address').value.trim();
            const postcode = document.getElementById('ship-postcode').value.trim();
            const stateName = document.getElementById('ship-state').value;

            if (!street || !/^[0-9]{5}$/.test(postcode) || !stateName) {
                showToast('Please enter a valid address, 5-digit postcode, and Malaysian state.', 'error');
                return;
            }

            state.confirmedAddress = street + ', ' + postcode + ' ' + stateName + ', Malaysia';

            document.getElementById('shipping-address-form').classList.add('hidden');
            document.getElementById('confirmed-address-box').classList.remove('hidden');
            document.getElementById('confirmed-address-text').textContent = state.confirmedAddress;

            const pill = document.getElementById('address-status-pill');
            pill.textContent = 'Confirmed';
            pill.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500';

            updatePaymentButtonState();
            showToast('Shipping address confirmed!');
        }

function editShippingAddress() {
            state.confirmedAddress = null;
            document.getElementById('shipping-address-form').classList.remove('hidden');
            document.getElementById('confirmed-address-box').classList.add('hidden');

            const pill = document.getElementById('address-status-pill');
            pill.textContent = 'Unconfirmed';
            pill.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500';

            updatePaymentButtonState();
        }

function updatePaymentButtonState() {
            const btn = document.getElementById('proceed-payment-btn');
            const label = document.getElementById('proceed-payment-label');
            if (!btn || !label) return;

            const ready = state.cart.length > 0 && Boolean(state.confirmedAddress);
            btn.disabled = !ready;

            if (ready) {
                btn.className = 'w-full bg-sky-600 hover:bg-sky-500 text-white cursor-pointer font-extrabold py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2';
                label.textContent = 'Proceed to Payment';
            } else {
                btn.className = 'w-full bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-extrabold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2';
                label.textContent = state.cart.length === 0 ? 'Cart is Empty' : 'Confirm Address First';
            }
        }

function openCheckoutModal() {
            if (!state.confirmedAddress || state.cart.length === 0) return;
            const totalPrice = state.cart.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);
            document.getElementById('checkout-ship-preview').textContent = state.confirmedAddress;
            document.getElementById('checkout-total-display').textContent = 'RM ' + totalPrice.toFixed(2);
            selectPaymentMethod('FPX Online Banking', document.querySelector('.payment-card-btn'));
            document.getElementById('checkout-modal').classList.remove('hidden');
        }

function selectPaymentMethod(methodName, btnEl) {
            document.getElementById('payment-method').value = methodName;
            document.querySelectorAll('.payment-card-btn').forEach(function(btn) {
                btn.className = 'payment-card-btn p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1';
            });
            if (btnEl) btnEl.className = 'payment-card-btn active p-3 rounded-2xl border-2 border-sky-500 bg-sky-500/10 text-sky-500 flex flex-col items-center gap-1';
            document.getElementById('panel-payment-fpx').classList.toggle('hidden', !methodName.startsWith('FPX'));
            document.getElementById('panel-payment-card').classList.toggle('hidden', !methodName.startsWith('Credit'));
            document.getElementById('panel-payment-qr').classList.toggle('hidden', methodName.startsWith('FPX') || methodName.startsWith('Credit'));
            if (methodName.startsWith('Credit')) loadSavedCardForCurrentUser();
        }

function formatCardNumber(input) {
            const digits = input.value.replace(/\D/g, '').slice(0, 16);
            input.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        }

function formatCardExpiry(input) {
            const digits = input.value.replace(/\D/g, '').slice(0, 4);
            input.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
        }

function loadSavedCardForCurrentUser() {
            const uname = state.currentUser ? state.currentUser.username : null;
            const saved = uname ? state.savedCards[uname] : null;
            document.getElementById('card-holder-name').value = saved ? saved.holder : '';
            document.getElementById('card-number-input').value = saved ? saved.number : '';
            document.getElementById('card-expiry-input').value = saved ? saved.expiry : '';
            document.getElementById('card-cvv-input').value = saved ? saved.cvv : '';
            const badge = document.getElementById('saved-card-badge');
            if (badge) badge.classList.toggle('hidden', !saved);
        }

function closeCheckoutModal() { document.getElementById('checkout-modal').classList.add('hidden'); }

function processPayment(e) {
            e.preventDefault();
            if (!state.confirmedAddress || state.cart.length === 0) return;
            const baseMethod = document.getElementById('payment-method').value;
            let finalPaymentLabel = baseMethod;
            if (baseMethod.startsWith('FPX')) {
                finalPaymentLabel = 'FPX Online Banking (' + document.getElementById('fpx-bank-select').value + ')';
            } else if (baseMethod.startsWith('Credit')) {
                const holder = document.getElementById('card-holder-name').value.trim();
                const rawNum = document.getElementById('card-number-input').value.replace(/\s+/g, '');
                const expiry = document.getElementById('card-expiry-input').value.trim();
                const cvv = document.getElementById('card-cvv-input').value.trim();
                if (!holder || rawNum.length < 16 || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length < 3) {
                    showToast('Please enter valid Card details.', 'error');
                    return;
                }
                if (state.currentUser && state.currentUser.username) {
                    state.savedCards[state.currentUser.username] = { holder: holder, number: rawNum.replace(/(\d{4})(?=\d)/g, '$1 '), expiry: expiry, cvv: cvv };
                }
                finalPaymentLabel = 'Credit / Debit Card (•••• ' + rawNum.slice(-4) + ')';
            } else {
                finalPaymentLabel = 'QR Payment (DuitNow / TNG)';
            }

            state.cart.forEach(function(item) {
                const prod = state.products.find(function(p) { return p.id === item.id; });
                if (prod) prod.stock = Math.max(0, prod.stock - item.qty);
            });

            const totalRm = state.cart.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);
            const nowStr = new Date().toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const newOrder = {
                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                customer: state.currentUser.username,
                date: nowStr,
                items: JSON.parse(JSON.stringify(state.cart)),
                total: totalRm,
                paymentMethod: finalPaymentLabel,
                shippingAddress: state.confirmedAddress,
                status: 'Processing',
                cancelReason: ''
            };

            state.orders.unshift(newOrder);
            state.cart = [];
            saveState();
            closeCheckoutModal();
            updateCartBadges();
            renderCartPage();
            openReceiptModal(newOrder.id);
            showToast('Payment successful! Official receipt generated.');
        }

function openReceiptModal(orderId) {
            const ord = state.orders.find(function(o) { return o.id === orderId; });
            if (!ord) return;
            document.getElementById('receipt-order-id').textContent = ord.id;
            document.getElementById('receipt-date').textContent = ord.date;
            document.getElementById('receipt-payment').textContent = ord.paymentMethod;
            document.getElementById('receipt-address').textContent = ord.shippingAddress;
            document.getElementById('receipt-total').textContent = 'RM ' + ord.total.toFixed(2);
            document.getElementById('receipt-items-list').innerHTML = ord.items.map(function(i) {
                return '<div class="flex justify-between gap-2"><span>' + i.qty + 'x ' + i.name + '</span><span class="font-bold shrink-0">RM ' + (i.price * i.qty).toFixed(2) + '</span></div>';
            }).join('');
            document.getElementById('receipt-modal').classList.remove('hidden');
        }

function closeReceiptModal() { document.getElementById('receipt-modal').classList.add('hidden'); }

function renderCustomerOrders() {
            const list = document.getElementById('customer-orders-list');
            if (!list) return;
            const myOrders = state.orders.filter(function(o) { return o.customer === state.currentUser.username; });
            if (myOrders.length === 0) {
                list.innerHTML = '<div class="col-span-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">You have not placed any orders yet.</div>';
                return;
            }
            list.innerHTML = myOrders.map(function(o) {
                const isShipped = o.status === 'Shipped' || o.status === 'Delivered';
                const isCancelled = o.status === 'Cancelled';
                const badgeClass = isCancelled ? 'bg-rose-500/15 text-rose-500' : isShipped ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500';
                const itemsText = o.items.map(function(i) { return i.qty + 'x ' + i.name; }).join(', ');
                return '<div class="customer-order-card bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 overflow-hidden">' +
                    '<div class="space-y-1.5 text-xs min-w-0">' +
                    '<div class="flex flex-wrap items-center justify-between gap-2">' +
                    '<span class="font-mono font-black text-sm text-sky-500">' + o.id + '</span>' +
                    '<span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ' + badgeClass + '">' + o.status + '</span>' +
                    '</div>' +
                    '<p class="text-slate-400 break-words">' + o.date + ' &bull; ' + o.paymentMethod + '</p>' +
                    '<p class="text-slate-600 dark:text-slate-300 font-semibold break-words"><i class="fa-solid fa-location-dot text-sky-500 mr-1"></i>' + o.shippingAddress + '</p>' +
                    '<div class="pt-1 text-slate-500 break-words">' + itemsText + '</div>' +
                    (o.cancelReason ? '<p class="text-rose-500 font-bold break-words">Cancel Reason: ' + o.cancelReason + '</p>' : '') +
                    '</div>' +
                    '<div class="customer-order-footer pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">' +
                    '<span class="text-base font-black">RM ' + o.total.toFixed(2) + '</span>' +
                    '<div class="customer-order-actions flex flex-wrap items-center gap-2">' +
                    '<button type="button" onclick="openReceiptModal(\'' + o.id + '\')" class="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold"><i class="fa-solid fa-receipt mr-1"></i> View Receipt</button>' +
                    (!isShipped && !isCancelled
                        ? '<button type="button" onclick="openCustomerCancelModal(\'' + o.id + '\')" class="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-extrabold">Cancel Order</button>'
                        : isShipped ? '<span class="text-[11px] font-extrabold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><i class="fa-solid fa-lock mr-1"></i>Cannot Cancel</span>' : '') +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }

function openCustomerCancelModal(orderId) {
            pendingCustCancelOrderId = orderId;
            document.getElementById('cust-cancel-order-label').textContent = orderId;
            document.getElementById('customer-cancel-modal').classList.remove('hidden');
        }

function closeCustomerCancelModal() { document.getElementById('customer-cancel-modal').classList.add('hidden'); pendingCustCancelOrderId = null; }

function confirmCustomerCancelOrder() {
            const ord = state.orders.find(function(o) { return o.id === pendingCustCancelOrderId; });
            if (!ord || ord.status === 'Shipped') { closeCustomerCancelModal(); return; }
            ord.status = 'Cancelled';
            ord.cancelReason = document.getElementById('cust-cancel-reason').value;
            ord.items.forEach(function(item) {
                const prod = state.products.find(function(p) { return p.id === item.id; });
                if (prod) prod.stock += item.qty;
            });
            saveState();
            closeCustomerCancelModal();
            renderCustomerOrders();
            showToast('Order ' + ord.id + ' has been cancelled.');
        }