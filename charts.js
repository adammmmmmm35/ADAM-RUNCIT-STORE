let salesChartInstance = null;
let candlestickChartInstance = null;
let pyramidChartInstance = null;

function renderSalesChart() {
            const ctx = document.getElementById('salesChart');
            if (!ctx || typeof Chart === 'undefined') return;
            const categories = ['Cases & Wallets', 'Audio', 'Charging', 'Protection', 'Accessories'];
            const revenueByCat = categories.map(function(cat) {
                let sum = 0;
                state.orders.filter(function(o) { return o.status !== 'Cancelled'; }).forEach(function(ord) {
                    ord.items.forEach(function(item) { if (item.category === cat) sum += item.price * item.qty; });
                });
                return sum;
            });

            if (salesChartInstance) salesChartInstance.destroy();
            if (candlestickChartInstance) candlestickChartInstance.destroy();
            if (pyramidChartInstance) pyramidChartInstance.destroy();

            const isDark = document.documentElement.classList.contains('dark');
            const isPhone = document.body.classList.contains('phone-preview-mode') || window.innerWidth < 640;
            const textColor = isDark ? '#cbd5e1' : '#334155';
            const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.25)';

            salesChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: isPhone ? ['Cases', 'Audio', 'Charge', 'Protect', 'Access.'] : categories,
                    datasets: [{ label: 'Sales Revenue (RM)', data: revenueByCat, backgroundColor: ['#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899'], borderRadius: 8 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: textColor, font: { size: isPhone ? 10 : 12 } } } },
                    scales: {
                        x: { ticks: { color: textColor, font: { size: isPhone ? 9 : 11 }, maxRotation: 0 }, grid: { display: false } },
                        y: { ticks: { color: textColor, font: { size: isPhone ? 9 : 11 } }, grid: { color: gridColor }, beginAtZero: true }
                    }
                }
            });

            const candleCtx = document.getElementById('candlestickChart');
            if (candleCtx) {
                const ohlcData = categories.map(function(cat, idx) {
                    const prices = state.products.filter(function(p) { return p.category === cat; }).map(function(p) { return p.price; });
                    const low = prices.length ? Math.min.apply(null, prices) : 50;
                    const high = prices.length ? Math.max.apply(null, prices) : 200;
                    return { low: low, high: high, open: Math.round(low + (high - low) * 0.25), close: Math.round(low + (high - low) * 0.78), bullish: idx % 2 === 0 };
                });
                candlestickChartInstance = new Chart(candleCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Cases', 'Audio', 'Charging', 'Protect', 'Access.'],
                        datasets: [{
                            label: 'Price Spread (RM)',
                            data: ohlcData.map(function(d) { return [d.open, d.close]; }),
                            backgroundColor: ohlcData.map(function(d) { return d.bullish ? '#10b981' : '#f43f5e'; }),
                            borderRadius: 4,
                            barThickness: 18
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor }, beginAtZero: true } }
                    }
                });
            }

            const pyramidCtx = document.getElementById('pyramidChart');
            if (pyramidCtx) {
                const shortCatMap = { 'Cases & Wallets': 'Cases', 'Audio': 'Audio', 'Charging': 'Charging', 'Protection': 'Protect', 'Accessories': 'Access.' };
                const stockByCat = categories.map(function(cat) {
                    return {
                        cat: isPhone ? (shortCatMap[cat] || cat) : cat,
                        stock: state.products.filter(function(p) { return p.category === cat; }).reduce(function(s, p) { return s + p.stock; }, 0)
                    };
                }).sort(function(a, b) { return a.stock - b.stock; });

                pyramidChartInstance = new Chart(pyramidCtx, {
                    type: 'bar',
                    data: {
                        labels: stockByCat.map(function(i) { return i.cat; }),
                        datasets: [{
                            label: 'Stock Units',
                            data: stockByCat.map(function(i) { return [-i.stock / 2, i.stock / 2]; }),
                            backgroundColor: ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#0284c7'],
                            borderRadius: 6
                        }]
                    },
                    options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { color: textColor, font: { size: isPhone ? 9 : 10 }, callback: function(v) { return Math.abs(v * 2); } }, grid: { color: gridColor } },
                            y: { ticks: { color: textColor, font: { size: isPhone ? 9 : 10 } }, grid: { display: false } }
                        }
                    }
                });
            }
        }