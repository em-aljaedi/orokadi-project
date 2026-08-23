let currentCategory = 'all';

// جلب المنتجات مع تصنيفها (الورد، الهدايا، الطاولات)
function getProductsData() {
    let products = JSON.parse(localStorage.getItem('orokadi_products_v2'));
    if (!products || products.length === 0) {
        products = [
            { id: 1, name: 'باقة ورد حمراء كلاسيك', price: 180, discount: null, image: 'images/flowerwite.jpeg', status: 'available', category: 'flowers' },
            { id: 2, name: 'تنسيق زهور الكادي مع هدية', price: 250, discount: null, image: 'images/boxkinder.jpeg', status: 'available', category: 'gifts' },
            { id: 3, name: 'box flower', price: 60, discount: 40, image: 'images/flowerwite.jpeg', status: 'available', category: 'flowers' },
            
        ];
        localStorage.setItem('orokadi_products_v2', JSON.stringify(products));
    }
    return products;
}

// دالة التصفية عند النقر على الأقسام في الأندكس
function filterProducts(category) {
    currentCategory = category;
    renderStoreProducts();
}

// عرض المنتجات وتنسيق قسم حجز الطاولات عند النقر عليه
function renderStoreProducts(searchQuery = '') {
    const products = getProductsData();
    const container = document.getElementById('products-container');
    const titleElement = document.getElementById('grid-title');
    if (!container) return;

    // إذا تم النقر على كرت "حجز الطاولات"
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

    // تحديث عنوان القسم حسب الاختيار
    if (titleElement) {
        if (currentCategory === 'flowers') titleElement.innerText = 'قسم الورد والزهور';
        else if (currentCategory === 'gifts') titleElement.innerText = 'قسم الهدايا الفاخرة';
        else titleElement.innerText = 'الأكثر مبيعاً';
    }

    // تصفية المنتجات حسب القسم والبحث
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
            : `<button onclick="addToCart(${p.id})" style="width: 100%; padding: 10px; background-color: #8b1832; color: #ffffff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; margin-top: 10px; transition: 0.2s;">إضافة إلى السلة</button>`;

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

// دالة البحث التفاعلي
function searchProducts() {
    const inputVal = document.getElementById('search-input').value;
    renderStoreProducts(inputVal);
}

// إضافة منتج للسلة
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

// تحديث عداد السلة في الأيقونة العلوية
function updateCartIconBadge() {
    let cart = JSON.parse(localStorage.getItem('orokadi_cart')) || [];
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.innerText = cart.length;
    }
}

// دالة إضافة منتج جديد من لوحة التحكم (مضافة هنا في النهاية)
// دالة إضافة منتج جديد من لوحة التحكم (محسنة وآمنة)
function addNewProduct(event) {
    event.preventDefault();

    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const imageEl = document.getElementById('product-image');
    const categoryEl = document.getElementById('product-category');

    if (!nameEl || !priceEl) {
        alert('خطأ: تأكد من وجود حقول الاسم والسعر في الصفحة.');
        return;
    }

    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value) || 0;
    
    // التعامل الذكي مع مسار الصورة
    let image = imageEl ? imageEl.value.trim() : '';
    if (!image) {
        image = 'images/logen.jpeg';
    } else if (!image.startsWith('images/') && !image.startsWith('http')) {
        image = 'images/' + image;
    }

    const category = categoryEl ? categoryEl.value : 'flowers';

    // جلب المنتجات من النسخة المحدثة v2
    let products = JSON.parse(localStorage.getItem('orokadi_products_v2')) || [];

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        image: image,
        category: category,
        status: 'available'
    };

    products.push(newProduct);
    
    // الحفظ في النسخة v2 لضمان ظهورها فوراً
    localStorage.setItem('orokadi_products_v2', JSON.stringify(products));

    alert('تم إضافة المنتج بنجاح إلى القسم المحدد! 🌸');
    location.reload();
}


document.addEventListener('DOMContentLoaded', () => {
    renderStoreProducts();
});
