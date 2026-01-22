
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;

const dbConfig = {
    host: 'puntoelectro.store',
    user: 'u693043966_puntoelectro',
    password: 'Darkdimi1996$',
    database: 'u693043966_puntoelectro',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 10000
};

const pool = mysql.createPool(dbConfig);

// Keep-alive connection
setInterval(async () => {
    try { await pool.query('SELECT 1'); } catch (e) {}
}, 30000);

const INITIAL_CONFIG = {
    theme: { background: '#f8fafc', primary: '#2563eb', secondary: '#0f172a', text: '#1e293b' },
    contact: { phone: '+54 11 1234 5678', email: 'ventas@puntoelectro.com.ar', address: 'Av. Corrientes 1234, Buenos Aires', hours: 'Lun a Vie 9:00 - 18:00 hs' },
    bestSellers: { enableAnimations: true, marqueeSpeed: 40, productIds: [] },
    hero: { badgeText: 'POTENCIA TU PROYECTO' },
    categoriesSection: { title: 'Categorías', subtitle: 'Encuentra todo lo que necesitas' },
    features: [
        { icon: 'Truck', title: "Envío Rápido", subtitle: "En 24hs en AMBA" },
        { icon: 'ShieldCheck', title: "Garantía", subtitle: "Oficial de fábrica" },
        { icon: 'CreditCard', title: "Cuotas", subtitle: "Sin interés" },
        { icon: 'BatteryCharging', title: "Asesoría", subtitle: "Técnica experta" }
    ],
    checkout: {
        whatsappNumber: '5491112345678',
        viewCartTitle: 'Mi Carrito',
        checkoutTitle: 'Finalizar Compra',
        successMessage: '¡Pedido enviado!',
        styles: { headerBg: '#ffffff', headerText: '#1e293b', checkoutBtnBg: '#0f172a', checkoutBtnText: '#ffffff', fontFamily: 'Inter' },
        fields: [{ id: 'address', label: 'Dirección', type: 'text', required: true, placeholder: 'Calle...', width: 'full' }],
        paymentMethods: [{ id: 'efectivo', label: 'Efectivo', subLabel: '10% OFF', icon: 'Banknote', active: true, discountPercent: 10 }]
    },
    promoBanner: {
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070',
        title: 'Soluciones integrales',
        text: 'Ingeniería y automatización.',
        ctaText: 'Solicitar',
        tagText: 'Profesional'
    },
    footer: { description: 'Líderes en distribución.', copyrightText: '© 2024 Punto Electro.' },
    banners: [],
    branches: [],
    sectionBackgrounds: {}
};

async function initializeDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Database connected. Initializing tables...");

        // Create Tables
        await connection.query(`CREATE TABLE IF NOT EXISTS config (id INT PRIMARY KEY, data JSON)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS productos (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255), categoria VARCHAR(255), marca VARCHAR(255), precio DECIMAL(10,2), stock INT, descripcion TEXT, imagen LONGTEXT, destacado BOOLEAN, descuento INT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS categorias (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255), imagen LONGTEXT)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS marcas (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255), categoria VARCHAR(255))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS servicios (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, icon VARCHAR(50))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS orders (id VARCHAR(255) PRIMARY KEY, customerName VARCHAR(255), customerEmail VARCHAR(255), customerPhone VARCHAR(255), total DECIMAL(10,2), status VARCHAR(50), date VARCHAR(50), data JSON)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(255), password VARCHAR(255), role VARCHAR(50))`);

        // CLEANUP: If requested, ensure tables are empty to start fresh (or leave them be if they have data)
        // Since the user asked to "Clean the database", we will NOT insert dummy data here.
        // We ensure config exists, but that's it.
        
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM config');
        if (rows[0].count === 0) {
            await connection.query('INSERT INTO config (id, data) VALUES (1, ?)', [JSON.stringify(INITIAL_CONFIG)]);
        }

        console.log("Database initialized.");

    } catch (err) {
        console.error('DB Init Error:', err.message);
    } finally {
        if (connection) connection.release();
    }
}

initializeDatabase();

// --- API ENDPOINTS ---

// CONFIG
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data FROM config WHERE id=1');
        if (rows.length > 0 && rows[0].data) {
             let data = rows[0].data;
             if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e) {} }
             res.json(data);
        } else {
             res.json(INITIAL_CONFIG);
        }
    } catch (e) {
        res.json(INITIAL_CONFIG); 
    }
});

app.post('/api/config', async (req, res) => {
    try {
        await pool.query('INSERT INTO config (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data=?', [JSON.stringify(req.body), JSON.stringify(req.body)]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json(rows.map(r => ({ ...r, id: r.id.toString(), price: Number(r.precio), featured: Boolean(r.destacado), image: r.imagen, name: r.nombre, category: r.categoria, brand: r.marca, description: r.descripcion, discount: r.descuento })));
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, category, brand, price, stock, description, image, featured } = req.body;
        const [result] = await pool.query('INSERT INTO productos (nombre, categoria, marca, precio, stock, descripcion, imagen, destacado, descuento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)', [name, category, brand, price, stock, description, image, featured]);
        res.json({ id: result.insertId.toString(), ...req.body });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, category, brand, price, stock, description, image, featured, discount } = req.body;
        await pool.query('UPDATE productos SET nombre=?, categoria=?, marca=?, precio=?, stock=?, descripcion=?, imagen=?, destacado=?, descuento=? WHERE id=?', [name, category, brand, price, stock, description, image, featured, discount, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products/bulk', async (req, res) => {
    try {
        const updates = req.body; // Array of {id, discount}
        // This is inefficient but functional for mysql2 without building complex queries
        for (const u of updates) {
            await pool.query('UPDATE productos SET descuento=? WHERE id=?', [u.discount, u.id]);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM productos WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias');
        res.json(rows.map(r => ({ id: r.id.toString(), name: r.nombre, image: r.imagen })));
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/categories', async (req, res) => {
    try {
        const [result] = await pool.query('INSERT INTO categorias (nombre, imagen) VALUES (?, ?)', [req.body.name, req.body.image]);
        res.json({ id: result.insertId.toString(), ...req.body });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        await pool.query('UPDATE categorias SET nombre=?, imagen=? WHERE id=?', [req.body.name, req.body.image, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM categorias WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// BRANDS
app.get('/api/brands', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM marcas');
        res.json(rows.map(r => ({ id: r.id.toString(), name: r.nombre, category: r.categoria })));
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/brands', async (req, res) => {
    try {
        const [result] = await pool.query('INSERT INTO marcas (nombre, categoria) VALUES (?, ?)', [req.body.name, req.body.category]);
        res.json({ id: result.insertId.toString(), ...req.body });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/brands/:id', async (req, res) => {
    try {
        await pool.query('UPDATE marcas SET nombre=?, categoria=? WHERE id=?', [req.body.name, req.body.category, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/brands/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM marcas WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// SERVICES
app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM servicios');
        res.json(rows.map(r => ({ id: r.id.toString(), title: r.title, description: r.description, icon: r.icon })));
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/services', async (req, res) => {
    try {
        const [result] = await pool.query('INSERT INTO servicios (title, description, icon) VALUES (?, ?, ?)', [req.body.title, req.body.description, req.body.icon]);
        res.json({ id: result.insertId.toString(), ...req.body });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/services/:id', async (req, res) => {
    try {
        await pool.query('UPDATE servicios SET title=?, description=?, icon=? WHERE id=?', [req.body.title, req.body.description, req.body.icon, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM servicios WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ORDERS
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY date DESC');
        res.json(rows.map(r => ({ 
            id: r.id, 
            customerName: r.customerName, 
            customerEmail: r.customerEmail,
            customerPhone: r.customerPhone,
            total: Number(r.total),
            status: r.status,
            date: r.date,
            ...((typeof r.data === 'string' ? JSON.parse(r.data) : r.data) || {}) 
        })));
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const o = req.body;
        const extraData = { items: o.items, deliveryMethod: o.deliveryMethod, deliveryAddress: o.deliveryAddress, paymentMethod: o.paymentMethod, notes: o.notes };
        await pool.query('INSERT INTO orders (id, customerName, customerEmail, customerPhone, total, status, date, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [o.id, o.customerName, o.customerEmail, o.customerPhone, o.total, o.status, o.date, JSON.stringify(extraData)]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const o = req.body;
        const extraData = { items: o.items, deliveryMethod: o.deliveryMethod, deliveryAddress: o.deliveryAddress, paymentMethod: o.paymentMethod, notes: o.notes };
        await pool.query('UPDATE orders SET status=?, total=?, data=? WHERE id=?', 
            [o.status, o.total, JSON.stringify(extraData), req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// USERS
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/users', async (req, res) => {
    try {
        const u = req.body;
        await pool.query('INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [u.id, u.name, u.email, u.phone, u.password, u.role]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
