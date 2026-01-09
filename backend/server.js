import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://sibsagar-digital-frontend.vercel.app", "https://sibsagar-digital.vercel.app"], 
    credentials: true
}));
app.use(bodyParser.json());

// Database Connection (Safe Mode)
let pool;
try {
    if (!process.env.DATABASE_URL) {
        console.error("❌ CRITICAL: DATABASE_URL is missing in Environment Variables!");
    } else {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000 // Fail fast if stuck
        });
        console.log("✅ Database pool created.");
    }
} catch (err) {
    console.error("❌ Failed to create database pool:", err);
}

// Helper to run queries safely
const query = async (text, params) => {
    if (!pool) throw new Error("Database not connected (Check Logs)");
    return await pool.query(text, params);
};

// Root Route (Health Check)
app.get('/', (req, res) => {
    if (!pool) return res.status(500).json({ status: "Error", message: "Database connection missing" });
    res.json({ status: "Ok", message: "Backend is running with PostgreSQL!" });
});

// Initialize Tables (Lazy Load)
const initDb = async () => {
    if (!pool) return;
    try {
        await query(`CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, title TEXT, category TEXT, year INTEGER, summary TEXT, image TEXT, content TEXT, infobox TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await query(`CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, title TEXT, text TEXT)`);
        await query(`CREATE TABLE IF NOT EXISTS resources (id SERIAL PRIMARY KEY, title TEXT, author TEXT, type TEXT, url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password TEXT)`);
        console.log("✅ Tables initialized");
    } catch (err) {
        console.error("❌ Table init failed:", err.message);
    }
};

// Run init immediately but don't crash
initDb();

// ================= ROUTES =================

app.get('/api/items', async (req, res) => {
    try {
        const { rows } = await query("SELECT * FROM items ORDER BY year ASC");
        const items = rows.map(row => ({
            ...row,
            content: JSON.parse(row.content || '[]'),
            infobox: JSON.parse(row.infobox || '[]')
        }));
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    const { title, category, year, summary, image, content, infobox } = req.body;
    try {
        const result = await query(
            `INSERT INTO items (title, category, year, summary, image, content, infobox) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [title, category, year, summary, image, JSON.stringify(content), JSON.stringify(infobox)]
        );
        res.json({ message: "Item added", id: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        await query("DELETE FROM items WHERE id = $1", [req.params.id]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pages', async (req, res) => {
    try {
        const { rows } = await query("SELECT * FROM pages");
        const pages = {};
        rows.forEach(row => { pages[row.id] = { title: row.title, text: row.text }; });
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pages', async (req, res) => {
    const { page, content } = req.body;
    try {
        await query(
            `INSERT INTO pages (id, title, text) VALUES ($1, $2, $3) 
             ON CONFLICT(id) DO UPDATE SET title=$2, text=$3`,
            [page, content.title, content.text]
        );
        res.json({ message: "Page updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/resources', async (req, res) => {
    try {
        const { rows } = await query("SELECT * FROM resources ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/resources', async (req, res) => {
    const { title, author, type, url } = req.body;
    try {
        const result = await query(
            "INSERT INTO resources (title, author, type, url) VALUES ($1, $2, $3, $4) RETURNING id", 
            [title, author, type, url]
        );
        res.json({ message: "Resource added", id: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
        if (rows.length > 0) {
            res.json({ token: "fake-jwt-token", user: rows[0].username });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// START SERVER LOGIC
// We only call app.listen() if we are NOT in a Vercel environment.
// Vercel exports the app and handles the server start automatically.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`✅ Local Server running at http://localhost:${PORT}`);
    });
}

// Required for Vercel
export default app;