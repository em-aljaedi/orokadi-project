const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// إنشاء قاعدة البيانات والتداول
const db = new sqlite3.Database('./orokadi.db', () => {
    console.log('تم الاتصال بقاعدة بيانات متجر أورو كادي');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, category TEXT, price REAL, stock INTEGER, image TEXT, description TEXT
    )`);

    // إضافة منتجات أولية تجريبية
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (title, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)");
            stmt.run("باقة ورد احمر", "flowers", 299, 10, "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500", "12 وردة جوري طبيعي مع تغليف فاخر");
            stmt.run("بوكس هدايا مميز", "gifts", 199, 5, "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500", "شوكلاتة بلجيكية مع بطاقة إهداء");
            stmt.run("تنسيق طاولة فاخرة", "tables", 1500, 2, "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500", "تنسيق كامل للمناسبات مع الورود والإضاءة");
            stmt.finalize();
        }
    });
});
// ... (هنا باقي الأكواد الموجودة عندك سابقاً في الملف) ...

// توجيه الصفحة الرئيسية للعميل
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// توجيه صفحة لوحة التحكم (الأدمن)
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

// سطر تشغيل السيرفر (مثل app.listen) يكون في النهاية بعدهن تماماً
// APIs
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => res.json(rows));
});

app.post('/api/admin/products', (req, res) => {
    const { title, category, price, stock, image, description } = req.body;
    db.run(`INSERT INTO products (title, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, category, price, stock, image, description],
        function() { res.json({ id: this.lastID, success: true }); }
    );
    
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
