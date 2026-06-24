const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Render SQL Database Connection String yahan lagani hai
const connectionString = process.env.DATABASE_URL || "postgresql://eventease_sql_db:RIw24XG6xnIqJbIaw142mEFNa9G1iIfF@dpg-d8tvtcugvqtc73aa9f70-a.singapore-postgres.render.com/eventease_sql_db";

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Live server connection ke liye zaroori hai
});

// 1. Test Route to check if API is alive
app.get('/', (req, res) => {
    res.send("Simple SQL API is running perfectly live on Render!");
});

// 2. API to Create Table (For testing database connectivity)
app.get('/setup-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL
            );
        `);
        res.status(200).json({ success: true, message: "Table 'test_users' created successfully in SQL database!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Simple API to Add User (Insert Task)
app.post('/api/sql-signup', async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO test_users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json({ success: true, data: result.rows[0], message: "User saved in SQL database successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Simple API to Get All Users (Select Task)
app.get('/api/sql-users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM test_users');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`SQL Test Server started on port ${PORT}`));