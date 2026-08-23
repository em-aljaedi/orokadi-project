// Import Firebase SDK via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات الربط الخاصة بكِ
const firebaseConfig = {
  apiKey: "AIzaSyDfEp9FAcU8f13YKZ-DZfzOQjEcgIi1Fq0",
  authDomain: "orokadi-store-fe838.firebaseapp.com",
  projectId: "orokadi-store-fe838",
  storageBucket: "orokadi-store-fe838.firebasestorage.app",
  messagingSenderId: "8253358848",
  appId: "1:8253358848:web:3c2282634c8d1f252f69e5",
  measurementId: "G-GQE2QY31KP"
};

// تهيئة فايربيس وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentCategory = 'all';
let productsCache = []; // تخزين مؤقت للمنتجات المجلبة من السحابة

// دالة لجلب المنتجات من سحابة فايربيس للجميع (للأدمن وللعملاء)
async function fetchProductsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsCache = [];
        querySnapshot.forEach((docSnap) => {
            productsCache.push({ id: docSnap.id, ...docSnap.data() });
        });

        // إذا كانت القاعدة فارغة تماماً، نضيف المنتجات الافتراضية لأول مرة
        if (productsCache.length === 0) {
            const defaultProducts = [
                { name: 'باقة ورد حمراء كلاسيك', price: 180, discount: null, image: 'images/flowerwite.jpeg', status: 'available', category: 'flowers' },
                { name: 'تنسيق زهور الكادي مع هدية', price: 250, discount: null, image: 'images/boxkinder.jpeg', status: 'available', category: 'gifts' },
                { name: 'box flower', price: 60, discount: 40, image: 'images/flowerwite.jpeg', status: 'available', category: 'flowers' },
                { name: 'هدية شوكولاتة فاخرة', price: 200, discount: null, image: 'images/baner.jpeg', status: 'available', category: 'gifts' }
            ];
            for (let p of defaultProducts) {
                await addDoc(collection(db, "products"), p);
            }
            return fetchProductsFromFirebase(); // إعادة الجلب بعد الإضافة
        }
    } catch (e) {
        console.error("Error fetching products from cloud: ", e);
    }
    renderStoreProducts();
}

function getProductsData() {
    return productsCache;
}

// دالة التصفية حسب الأقسام
function filterProducts(category) {
    currentCategory = category;
    renderStoreProducts();
}

// عرض المنتجات في الواجهة الرئيسية
function renderStoreProducts(searchQuery = '') {
    const products = getProductsData();
    const container = document.getElementById('products-container');
    const titleElement = document.getElementById('grid-title');
    if (!container) return;

    // قسم حجز الطاولات
    if (currentCategory === 'tables') {
        if (titleElement) titleElement.innerText = 'خدمة حجز وتنظيم الطاولات والمناسبات';
        container.innerHTML = `
            <div style="grid-column: 1 / -1; background: #fff; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <img src="images/Tabl.png" alt="حجز طاولات" onerror="this.src='images/logen.jpeg'" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #8b1832; margin-bottom: 10px; font-size: 20px;">حجز وتنسيق الطاولات وقاعات المناسبات</h3>
                <p style="color: #666; margin-bottom: 20px; font-size: 14px;">نقدم لكم أرقى خدمات تنسيق الطاولات، تجهيز الحفلات، وتنسيق الزهور الطبيعية للمناسبات الخاصة.</p>
                <a href="cart.html" style="background: #8b1832; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">احجز مناسبتك الآن 🌸</a>
            </div>
        `;
        updateCartIconBadge();
        return;
    }

    if (titleElement) {
        if (currentCategory === 'flowers') titleElement.innerText = 'قسم الورد والزهور';
        else if (currentCategory === 'gifts') titleElement.innerText = 'قسم الهدايا الفاخرة';
        else titleElement.innerText = 'الأكثر مبيعاً';
    }

    let filtered = products.filter(p => {
        let matchCat = (currentCategory === 'all' || !p.category) ? true : p.category === currentCategory;
        let matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #777; padding: 40px;">لا توجد منتجات مطابقة في هذا القسم حالياً.</p>`;
        updateCartIconBadge();
        return;
    }

    container.innerHTML = filtered.map(p => {
        const isOut = p.status === 'out_of_stock';
        let priceHTML = p.discount 
            ? `<del style="color: #888; text-decoration: line-through; margin-left: 6px; font-size: 13px;">${p.price} ر.س</del> <span style="color: #8b1832; font-weight: bold; font-size: 15px;">${p.discount} ر.س</span>`
            : `<span style="font-weight: bold; font-size: 15px; color: #8b1832;">${p.price} ر.س</span>`;

        let actionHTML = isOut 
            ? `<button disabled style="width: 100%; padding: 10px; background-color: #d32f2f; color: #ffffff; border: none; border-radius: 8px; font-weight: bold; cursor: not-allowed; font-size: 13px; margin-top: 10px;">❌ نفدت الكمية</button>`
            : `<button onclick="addToCart('${p.id}')" style="width: 100%; padding: 10px; background-color: #8b1832; color: #ffffff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; margin-top: 10px; transition: 0.2s;">إضافة إلى السلة</button>`;

        return `
            <div class="product-card" style="background: #fff; border-radius: 12px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                ${isOut ? `<span style="position: absolute; top: 10px; right: 10px; background: #d32f2f; color: #fff; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">نفدت الكمية</span>` : ''}
                <div style="height: 160px; overflow: hidden; border-radius: 8px; margin-bottom: 12px;">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='images/logen.jpeg'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 6px;">${p.name}</h3>
                <div class="price" style="margin-bottom: 6px;">${priceHTML}</div>
                ${actionHTML}
            </div>
        `;
    }).join('');

    updateCartIconBadge();
}

function searchProducts() {
    const inputVal = document.getElementById('search-input').value;
    renderStoreProducts(inputVal);
}

function addToCart(productId) {
    const products = getProductsData();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('orokadi_cart')) || [];
    cart.push(product);
    localStorage.setItem('orokadi_cart', JSON.stringify(cart));

    updateCartIconBadge();
    alert(`تمت إضافة "${product.name}" إلى السلة بنجاح! 🛒`);
}

function updateCartIconBadge() {
    let cart = JSON.parse(localStorage.getItem('orokadi_cart')) || [];
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.innerText = cart.length;
    }
}

// دالة إضافة منتج جديد من لوحة التحكم وحفظه في السحابة فوراً
async function addNewProduct(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value.trim() || 'images/logen.jpeg';
    const category = document.getElementById('product-category').value;

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: image,
            category: category,
            status: 'available',
            createdAt: Date.now()
        });

        alert('تم إضافة المنتج بنجاح إلى السحابة وسيشاهده جميع العملاء فوراً! 🌸');
        location.reload();
    } catch (e) {
        alert('حدث خطأ أثناء الحفظ بالسحابة: ' + e.message);
    }
}

// جعل دالة الإضافة متاحة عالمياً في الـ HTML
window.addNewProduct = addNewProduct;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.addToCart = addToCart;

// تشغيل جلب البيانات فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    fetchProductsFromFirebase();
});
