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
    origin: ["http://localhost:5173", "https://your-frontend-project.vercel.app"],
    credentials: true
}));
app.use(bodyParser.json());

// Database Connection (PostgreSQL)
// We use a connection pool for better performance
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for most cloud databases (Neon, Vercel Postgres)
    }
});

// Test Connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('✅ Connected to PostgreSQL database');
    release();
    initDb();
});

// Initialize Tables
async function initDb() {
    try {
        // Items Table
        await pool.query(`CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            title TEXT,
            category TEXT,
            year INTEGER,
            summary TEXT,
            image TEXT,
            content TEXT, 
            infobox TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Pages Table
        await pool.query(`CREATE TABLE IF NOT EXISTS pages (
            id TEXT PRIMARY KEY,
            title TEXT,
            text TEXT
        )`);

        // Resources Table
        await pool.query(`CREATE TABLE IF NOT EXISTS resources (
            id SERIAL PRIMARY KEY,
            title TEXT,
            author TEXT,
            type TEXT,
            url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )`);

        await seedData();
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
}

async function seedData() {
    try {
        // Seed Admin User
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", ['admin']);
        if (userCheck.rows.length === 0) {
            await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", ['admin', 'admin123']);
            console.log("Admin user created (admin/admin123)");
        }

        // Seed Pages
        const defaults = {
            about: { title: "About Project", text: "Sibsagar Digital is a comprehensive effort to digitize, preserve, and showcase the rich heritage of the Ahom Kingdom..." },
            speech: { title: "Authority Speech", text: "\"The history of Sivasagar is not just the history of a district...\"" },
            district: { title: "Sivasagar District", text: "Sivasagar, formerly known as Rangpur, was the capital of the Ahom Kingdom..." }
        };

        for (const [key, val] of Object.entries(defaults)) {
            const pageCheck = await pool.query("SELECT * FROM pages WHERE id = $1", [key]);
            if (pageCheck.rows.length === 0) {
                await pool.query("INSERT INTO pages (id, title, text) VALUES ($1, $2, $3)", [key, val.title, val.text]);
            }
        }
    } catch (err) {
        console.error("Error seeding data:", err);
    }
}

// ================= ROUTES =================

app.get('/', (req, res) => {
    res.json("Backend is running with PostgreSQL!");
});

// --- ITEMS (ARTIFACTS) ---
app.get('/api/items', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM items ORDER BY year ASC");
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
        const result = await pool.query(
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
        await pool.query("DELETE FROM items WHERE id = $1", [req.params.id]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PAGES (CMS) ---
app.get('/api/pages', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM pages");
        const pages = {};
        rows.forEach(row => {
            pages[row.id] = { title: row.title, text: row.text };
        });
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pages', async (req, res) => {
    const { page, content } = req.body;
    if (!page || !content) return res.status(400).json({ error: "Missing data" });

    try {
        await pool.query(
            `INSERT INTO pages (id, title, text) VALUES ($1, $2, $3) 
             ON CONFLICT(id) DO UPDATE SET title=$2, text=$3`,
            [page, content.title, content.text]
        );
        res.json({ message: "Page updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RESOURCES ---
app.get('/api/resources', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM resources ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/resources', async (req, res) => {
    const { title, author, type, url } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO resources (title, author, type, url) VALUES ($1, $2, $3, $4) RETURNING id", 
            [title, author, type, url]
        );
        res.json({ message: "Resource added", id: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
        if (rows.length > 0) {
            res.json({ token: "fake-jwt-token-12345", user: rows[0].username });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Start Server
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`✅ Postgres Backend running at http://localhost:${PORT}`);
    });
}

export default app;