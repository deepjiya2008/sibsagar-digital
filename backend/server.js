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

/**
 * CORS Configuration
 * Improved to handle local development and Vercel subdomains dynamically.
 */
const allowedOrigins = [
    "http://localhost:5173", 
    "https://sibsagar-digital-frontend.vercel.app", 
    "https://sibsagar-digital.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || 
                         origin.endsWith(".vercel.app"); // Allow all vercel previews
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
            connectionTimeoutMillis: 10000 // Increased timeout for serverless cold starts
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
    res.json({ 
        status: "Ok", 
        message: "Backend is running!",
        dbStatus: pool ? "Connected" : "Disconnected"
    });
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

initDb();

// ================= ROUTES =================

app.get('/api/items', async (req, res) => {
    try {
        const { rows } = await query("SELECT * FROM items ORDER BY year ASC");
        const items = rows.map(row => ({
            ...row,
            content: typeof row.content === 'string' ? JSON.parse(row.content || '[]') : (row.content || []),
            infobox: typeof row.infobox === 'string' ? JSON.parse(row.infobox || '[]') : (row.infobox || [])
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
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Local Server running at http://localhost:${PORT}`);
    });
}

export default app;
