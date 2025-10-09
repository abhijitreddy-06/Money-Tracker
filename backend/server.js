import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//env config
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error', err.stack));

//auth middleware

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (!token || token === 'null') {
            return res.status(401).json({ message: 'Token not provided.' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({ message: 'Token has expired. Please log in again.' });
                }
                return res.status(403).json({ message: 'Token is invalid.' });
            }


            req.user = decoded;
            console.log("Decoded JWT payload:", decoded);

            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization header is missing.' });
    }
};

//bcrypt salt rounds
const saltRounds = 10;
//user registration
app.post('/api/register', (req, res) => {
    const { name, phone, password } = req.body;
    const myPlaintextPassword = password;
    bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });

        }
        pool.query('INSERT INTO users (name, phone, password) VALUES ($1, $2, $3)', [name, phone, hash], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});


//user login
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
    }
    console.log("Login request body:", req.body);

    pool.query('SELECT * FROM users WHERE phone = $1', [phone], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log("DB result:", result.rows);


        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found. Please create an account.' });
        }

        const user = result.rows[0];
        console.log(user);
        console.log("Decoded user:", req.user);

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password compare error:', err);
                return res.status(500).json({ message: 'Error comparing passwords' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            console.log("Signing JWT with id:", user.id);
            // Sign JWT
            const token = jwt.sign({ userid: user.id }, JWT_SECRET, { expiresIn: '7d' });
            console.log("Generated Token:", token);
            // Return token and user info (optional)
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone
                },
                message: 'Login successful'
            });
        });
    });
});


//current balance
app.post('/api/balance', authenticateToken, async (req, res) => {
    const { balance } = req.body;
    const userid = req.user.userid;

    try {
        await pool.query(`
            INSERT INTO users_balance (userid, balance) 
            VALUES ($1, $2)
            ON CONFLICT (userid) 
            DO UPDATE SET balance = EXCLUDED.balance
        `, [userid, balance]);

        res.json({ message: 'Balance updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
// Check if balance exists for user
app.get('/api/check-balance', authenticateToken, async (req, res) => {
    const userid = req.user.userid;

    try {
        const result = await pool.query(
            'SELECT balance FROM users_balance WHERE userid = $1',
            [userid]
        );

        if (result.rows.length === 0) {
            return res.json({ hasBalance: false });
        }

        return res.json({ hasBalance: true, balance: result.rows[0].balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

//spent money
app.post('/api/spend', authenticateToken, async (req, res) => {
    const { amount, for_what, place, date } = req.body;
    const userid = req.user.userid;

    try {
        await pool.query(
            'INSERT INTO user_spend (user_id, amount, for_what, place, spend_date) VALUES ($1, $2, $3, $4, $5)',
            [userid, amount, for_what, place, date]
        );

        await pool.query(
            'UPDATE users_balance SET balance = balance - $1 WHERE userid = $2',
            [amount, userid]
        );

        res.json({ message: 'Spend record added & balance updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});


//lend money
app.post('/api/lend', authenticateToken, async (req, res) => {
    const { amount, to_whom, return_date } = req.body;
    const user_id = req.user.userid; // from JWT payload

    // Basic validation
    if (!amount || !to_whom || !return_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check balance before lending
        const balanceRes = await client.query(
            'SELECT balance FROM users_balance WHERE userid = $1',
            [user_id]
        );

        if (balanceRes.rows.length === 0) {
            throw new Error('User balance record not found');
        }

        const currentBalance = balanceRes.rows[0].balance;

        // Insert lend record
        await client.query(
            `INSERT INTO user_lend (user_id, amount, to_whom, return_date) 
             VALUES ($1, $2, $3, $4)`,
            [user_id, amount, to_whom, return_date]
        );

        // Deduct balance
        await client.query(
            'UPDATE users_balance SET balance = balance - $1 WHERE userid = $2',
            [amount, user_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Lend record added & balance updated successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in /lend:', err.message);
        res.status(500).json({ message: err.message || 'Database error' });
    } finally {
        client.release();
    }
});


app.get('/api/lend', authenticateToken, async (req, res) => {
    const user_id = req.user.userid; // JWT payload

    try {
        const result = await pool.query(
            `SELECT lend_id, amount, to_whom, return_date, created_at
             FROM user_lend
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json({ message: 'No lend records yet' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching lend records:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

app.get('/api/spend', authenticateToken, async (req, res) => {
    const user_id = req.user.userid;

    try {
        const result = await pool.query(
            `SELECT spend_id, amount, for_what, place, spend_date
             FROM user_spend
             WHERE user_id = $1
             ORDER BY spend_date DESC`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json({ message: 'No spend records yet' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching spend records:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});
// Get all borrowed records
app.get('/api/borrow', authenticateToken, async (req, res) => {
    const user_id = req.user.userid;

    try {
        const result = await pool.query(
            `SELECT borrow_id, amount, for_what, from_whom, return_date, created_at
             FROM user_borrow
             WHERE userid = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json({ message: 'No borrowed records yet' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching borrowed records:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

//borrow money
app.post('/api/borrow', authenticateToken, async (req, res) => {
    const { amount, for_what, from_whom, return_date } = req.body;
    const userid = req.user.userid;

    try {
        // Insert borrow record
        await pool.query(
            'INSERT INTO user_borrow (userid, amount, for_what, from_whom, return_date) VALUES ($1, $2, $3, $4, $5)',
            [userid, amount, for_what, from_whom, return_date]
        );

        // Add to balance
        await pool.query(
            'UPDATE users_balance SET balance = balance + $1 WHERE userid = $2',
            [amount, userid]
        );

        // Send a single response
        res.json({ message: 'Borrow recorded and balance updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});


//deposit money
app.post('/api/deposit', authenticateToken, async (req, res) => {
    const { amount, fromWhom, date } = req.body;
    const userid = req.user.userid;

    try {
        // Insert deposit record
        await pool.query(
            'INSERT INTO user_deposit (user_id, amount, source, deposit_date) VALUES ($1, $2, $3, $4)',
            [userid, amount, fromWhom, date]
        );

        // Update user's balance
        await pool.query(
            'UPDATE users_balance SET balance = balance + $1 WHERE userid = $2',
            [amount, userid]
        );

        res.json({ message: 'Deposit recorded and balance updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});


//history

app.get('/api/history', authenticateToken, async (req, res) => {
    const user_id = req.user.userid;

    const query = `
    SELECT 
        'Spent' AS type,
        amount,
        for_what AS description,
        place AS details,
        spend_date AS date
    FROM user_spend
    WHERE user_id = $1

    UNION ALL

    SELECT
        'Lent' AS type,
        amount,
        to_whom AS description,
        'Return by ' || return_date AS details,
        COALESCE(created_at, NOW()) AS date
    FROM user_lend
    WHERE user_id = $1

    UNION ALL

    SELECT
        'Borrowed' AS type,
        amount,
        from_whom AS description,
        'Due by ' || return_date AS details,
        COALESCE(created_at, NOW()) AS date
    FROM user_borrow
    WHERE userid = $1

    UNION ALL

    SELECT
        'Deposit' AS type,
        amount,
        source AS description,
        NULL AS details,
        deposit_date AS date
    FROM user_deposit
    WHERE user_id = $1

    ORDER BY date DESC;
    `;

    try {
        const { rows } = await pool.query(query, [user_id]);
        res.json(rows);
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get user profile + record counts
app.get('/api/profile', authenticateToken, async (req, res) => {
    const user_id = req.user.userid;

    try {
        // Fetch user info
        const userResult = await pool.query(
            'SELECT id, name, phone FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Fetch record counts
        const [lendResult, spendResult, borrowResult, depositResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM user_lend WHERE user_id = $1', [user_id]),
            pool.query('SELECT COUNT(*) FROM user_spend WHERE user_id = $1', [user_id]),
            pool.query('SELECT COUNT(*) FROM user_borrow WHERE userid = $1', [user_id]),
            pool.query('SELECT COUNT(*) FROM user_deposit WHERE user_id = $1', [user_id]),
        ]);

        res.json({
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone
            },
            records: {
                lend: parseInt(lendResult.rows[0].count),
                spent: parseInt(spendResult.rows[0].count),
                borrowed: parseInt(borrowResult.rows[0].count),
                deposit: parseInt(depositResult.rows[0].count)
            }
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});
// Get all deposit records
// Get all deposit records for the logged-in user
app.get('/api/deposit', authenticateToken, async (req, res) => {
    const user_id = req.user.userid;

    try {
        const result = await pool.query(
            `SELECT deposit_id, amount, source, deposit_date, created_at
             FROM user_deposit
             WHERE user_id = $1
             ORDER BY deposit_date DESC`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json([]);
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching deposit records:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});





// app.get('/lend', authenticateToken, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
app.get('/api/home', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// app.get('/borrow', authenticateToken, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
app.get("/", (req, res) => {
    res.json({ message: "Backend is alive 🚀" });
});
app.get("/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ status: "ok", time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: "error", error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

