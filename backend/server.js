import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Updated to use Vercel's port
const verboseSqlite = sqlite3.verbose();

// Middleware
app.use(cors({
    // Replace with your actual frontend Vercel URL once deployed
    origin: ["http://localhost:5173", "https://your-frontend-project.vercel.app"],
    credentials: true
}));
app.use(bodyParser.json());

// Database Setup
// NOTE: On Vercel, this file is READ-ONLY. Changes won't persist.
const dbPath = path.resolve(__dirname, 'archive.db');
const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

// Initialize Tables
function initDb() {
    db.serialize(() => {
        // Items Table
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            category TEXT,
            year INTEGER,
            summary TEXT,
            image TEXT,
            content TEXT,
            infobox TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Pages Table
        db.run(`CREATE TABLE IF NOT EXISTS pages (
            id TEXT PRIMARY KEY,
            title TEXT,
            text TEXT
        )`);

        // Resources Table
        db.run(`CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            type TEXT,
            url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        seedData();
    });
}

function seedData() {
    // ... existing code ...
    // (Kept your existing seed logic)
    db.get("SELECT * FROM users WHERE username = ?", ['admin'], (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', 'admin123']);
        }
    });

    const defaults = {
        about: { title: "About Project", text: "Sibsagar Digital is a comprehensive effort..." },
        speech: { title: "Authority Speech", text: "\"The history of Sivasagar is not just...\"" },
        district: { title: "Sivasagar District", text: "Sivasagar, formerly known as Rangpur..." }
    };

    Object.keys(defaults).forEach(key => {
        db.get("SELECT * FROM pages WHERE id = ?", [key], (err, row) => {
            if (!row) {
                db.run("INSERT INTO pages (id, title, text) VALUES (?, ?, ?)", [key, defaults[key].title, defaults[key].text]);
            }
        });
    });
}

// ================= ROUTES =================

app.get('/', (req, res) => {
    res.json("Backend is running!");
});

// --- ITEMS (ARTIFACTS) ---
app.get('/api/items', (req, res) => {
    db.all("SELECT * FROM items ORDER BY year ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const items = rows.map(row => ({
            ...row,
            content: JSON.parse(row.content || '[]'),
            infobox: JSON.parse(row.infobox || '[]')
        }));
        res.json(items);
    });
});

app.post('/api/items', (req, res) => {
    const { title, category, year, summary, image, content, infobox } = req.body;
    const sql = `INSERT INTO items (title, category, year, summary, image, content, infobox) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [title, category, year, summary, image, JSON.stringify(content), JSON.stringify(infobox)];
    
    db.run(sql, params, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Item added", id: this.lastID });
    });
});

app.delete('/api/items/:id', (req, res) => {
    db.run("DELETE FROM items WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item deleted" });
    });
});

// --- PAGES (CMS) ---
app.get('/api/pages', (req, res) => {
    db.all("SELECT * FROM pages", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const pages = {};
        rows.forEach(row => {
            pages[row.id] = { title: row.title, text: row.text };
        });
        res.json(pages);
    });
});

app.post('/api/pages', (req, res) => {
    const { page, content } = req.body;
    if (!page || !content) return res.status(400).json({ error: "Missing data" });

    const sql = `INSERT INTO pages (id, title, text) VALUES (?, ?, ?) 
                 ON CONFLICT(id) DO UPDATE SET title=excluded.title, text=excluded.text`;
    
    db.run(sql, [page, content.title, content.text], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Page updated" });
    });
});

// --- RESOURCES ---
app.get('/api/resources', (req, res) => {
    db.all("SELECT * FROM resources ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/resources', (req, res) => {
    const { title, author, type, url } = req.body;
    db.run("INSERT INTO resources (title, author, type, url) VALUES (?, ?, ?, ?)", [title, author, type, url], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Resource added", id: this.lastID });
    });
});

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (row) {
            res.json({ token: "fake-jwt-token-12345", user: row.username });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

// Start Server Logic for Vercel + Local
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    // Run directly (local)
    app.listen(PORT, () => {
        console.log(`✅ Backend Server running at http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;