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
 
// 3. API to Create Users Table for Signup/Login testing
app.get('/setup-users-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
        res.send("Success: 'users' table created or already exists in Render SQL database!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating users table: " + err.message);
    }
});

 

// 4. Real Signup API for testing users table
app.post('/api/sql-signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, password]
        );
        res.status(201).json({ 
            success: true, 
            data: result.rows[0], 
            message: "Mubarak ho! User saved in Render SQL Database live!" 
        });
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