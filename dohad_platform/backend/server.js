const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// ─── Auth Database (user login/signup) ───────────────────────────────────────
const authDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'D3vilishere',
    database: 'dohad_auth'
});

authDb.connect(err => {
    if (err) { console.error('Error connecting to dohad_auth DB:', err); return; }
    console.log('Connected to dohad_auth (auth database)!');
});

// ─── Research Database (DOHaD papers) ────────────────────────────────────────
const researchDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'D3vilishere',
    database: 'DOHaD'
});

researchDb.connect(err => {
    if (err) { console.error('Error connecting to DOHaD research DB:', err); return; }
    console.log('Connected to DOHaD (research database)!');
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Route: Sign Up
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO `login details` (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        authDb.query(sql, [firstName, lastName, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists.' });
                return res.status(500).json({ error: 'Database error occurred during signup.' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server formatting error.' });
    }
});

// Route: Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    authDb.query('SELECT * FROM `login details` WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error occurred during login.' });
        if (results.length === 0) return res.status(404).json({ error: "Account doesn't exist or email is incorrect." });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        res.status(200).json({ message: 'Logged in successfully!', user: { firstName: user.first_name, email: user.email } });
    });
});

// ─── Research Paper Routes ────────────────────────────────────────────────────

/**
 * GET /api/papers
 * Returns all research papers from the DOHaD database.
 * Uses the all_papers view and LEFT JOINs arsenic_prenatal for richer fields.
 */
app.get('/api/papers', (req, res) => {
    const sql = `
        SELECT
            pmid,
            title,
            abstract,
            journal,
            pubYear AS year,
            toxicant,
            dose,
            NULL AS exposure_window,
            NULL AS key_finding,
            country,
            organ,
            'prenatal_heavy_metals.csv' AS source_file,
            species
        FROM papers
        ORDER BY pubYear DESC
    `;
    researchDb.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching papers:', err);
            return res.status(500).json({ error: 'Failed to fetch papers from DOHaD database.' });
        }
        res.json(results);
    });
});

/**
 * GET /api/papers/count
 * Returns total paper count and year range for the homepage stats.
 */
app.get('/api/papers/count', (req, res) => {
    const sql = `
        SELECT
            COUNT(DISTINCT pmid) AS total,
            MIN(pubYear) AS min_year,
            MAX(pubYear) AS max_year
        FROM papers
    `;
    researchDb.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch count.' });
        res.json(results[0]);
    });
});

/**
 * GET /api/papers/countries
 * Returns unique countries for the filter dropdown.
 */
app.get('/api/papers/countries', (req, res) => {
    const sql = `SELECT DISTINCT country FROM papers WHERE country IS NOT NULL AND country != '' ORDER BY country ASC`;
    researchDb.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch countries.' });
        res.json(results.map(r => r.country));
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`DOHaD Backend Server running on http://localhost:${PORT}`);
});
