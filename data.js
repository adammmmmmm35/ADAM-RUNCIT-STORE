const MALAYSIA_STATES = ["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Pulau Pinang","Perak","Perlis","Sabah","Sarawak","Selangor","Terengganu","Wilayah Persekutuan"];
const DEFAULT_USERS = [{"id":"USR-01","username":"customer","password":"adamje","email":"customer@adamruncit.my","phone":"012-3456789","role":"customer","address":"No. 18, Jalan Bukit Bintang, Kuala Lumpur"},{"id":"USR-02","username":"admin","password":"admin123","email":"admin@adamruncit.my","phone":"019-8765432","role":"admin","address":"HQ Adam Runcit Store, Shah Alam, Selangor"}];
const DEFAULT_PRODUCTS = [{"id":"P01","name":"Apple MagSafe Clear Case (iPhone 16 Pro Max)","category":"Cases & Wallets","price":219,"stock":25,"icon":"fa-mobile-screen-button","isElectronic":false},{"id":"P02","name":"AirPods Pro (2nd Gen) USB-C MagSafe","category":"Audio","price":1099,"stock":14,"icon":"fa-headphones","isElectronic":true},{"id":"P03","name":"Apple 20W USB-C Power Adapter (UK 3-Pin)","category":"Charging","price":99,"stock":40,"icon":"fa-plug","isElectronic":true},{"id":"P04","name":"MagSafe Wireless Charger (15W Fast Charge)","category":"Charging","price":179,"stock":22,"icon":"fa-bolt","isElectronic":true},{"id":"P05","name":"FineWoven MagSafe Wallet with Find My","category":"Cases & Wallets","price":279,"stock":15,"icon":"fa-wallet","isElectronic":false},{"id":"P06","name":"Spigen Glas.tR EZ Fit Tempered Glass (2-Pack)","category":"Protection","price":79,"stock":35,"icon":"fa-shield-halved","isElectronic":false},{"id":"P07","name":"Apple AirTag Item Tracker (Single Pack)","category":"Accessories","price":149,"stock":30,"icon":"fa-location-crosshairs","isElectronic":true},{"id":"P08","name":"240W Braided USB-C Charge Cable (2m)","category":"Accessories","price":129,"stock":28,"icon":"fa-ethernet","isElectronic":true},{"id":"P09","name":"Anker 622 MagGo Magnetic Power Bank 5000mAh","category":"Charging","price":199,"stock":18,"icon":"fa-battery-full","isElectronic":true},{"id":"P10","name":"Sapphire Camera Lens Protector Ring Set","category":"Protection","price":59,"stock":32,"icon":"fa-camera","isElectronic":false}];
const DEFAULT_ORDERS = [{"id":"ORD-1001","customer":"customer","date":"14 Nov 2026, 02:30 PM","items":[{"id":"P01","name":"Apple MagSafe Clear Case (iPhone 16 Pro Max)","category":"Cases & Wallets","price":219,"qty":1},{"id":"P03","name":"Apple 20W USB-C Power Adapter (UK 3-Pin)","category":"Charging","price":99,"qty":1}],"total":318,"paymentMethod":"FPX Online Banking (Maybank2u)","shippingAddress":"No. 18, Jalan Bukit Bintang, 55100 Wilayah Persekutuan","status":"Processing","cancelReason":""}];
function loadStorage(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return JSON.parse(JSON.stringify(fallback));
                return JSON.parse(raw);
            } catch (err) {
                return JSON.parse(JSON.stringify(fallback));
            }
        }
let state = { users: loadStorage('ars_users', DEFAULT_USERS), products: loadStorage('ars_products', DEFAULT_PRODUCTS), orders: loadStorage('ars_orders', DEFAULT_ORDERS), currentUser: null, cart: loadStorage('ars_cart', []), savedCards: loadStorage('ars_saved_cards', {}), confirmedAddress: null };
function saveState() {
            try {
                localStorage.setItem('ars_users', JSON.stringify(state.users));
                localStorage.setItem('ars_products', JSON.stringify(state.products));
                localStorage.setItem('ars_orders', JSON.stringify(state.orders));
                localStorage.setItem('ars_cart', JSON.stringify(state.cart));
                localStorage.setItem('ars_saved_cards', JSON.stringify(state.savedCards));
            } catch (e) {}
        }