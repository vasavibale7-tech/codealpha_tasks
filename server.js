const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));

const db = new sqlite3.Database(
    path.join(__dirname, "ecommerce.db"),
    (err) => {
        if (err) {
            console.log("Database connection failed");
        } else {
            console.log("Database connected successfully");
        }
    }
);

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            total REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {

        if (!err && row.count === 0) {

            const products = [
                ["Smart Watch", "Smart watch with fitness tracking", 1999],
                ["Wireless Headphones", "Wireless headphones with clear sound", 1499],
                ["Bluetooth Speaker", "Portable Bluetooth speaker", 999]
            ];

            const stmt = db.prepare(
                "INSERT INTO products (name, description, price) VALUES (?, ?, ?)"
            );

            products.forEach((product) => {
                stmt.run(product);
            });

            stmt.finalize();

            console.log("Products added successfully");
        }
    });
});


app.get("/api/products", (req, res) => {

    db.all("SELECT * FROM products", (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: "Unable to get products"
            });
        }

        res.json(rows);
    });
});


app.post("/api/register", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        function (err) {

            if (err) {
                return res.status(400).json({
                    message: "Username already exists"
                });
            }

            res.json({
                message: "Registration successful"
            });
        }
    );
});


app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, user) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            res.json({
                message: "Login successful"
            });
        }
    );
});


app.post("/api/orders", (req, res) => {

    const { username, total } = req.body;

    if (!username || total === undefined) {
        return res.status(400).json({
            message: "Username and total are required"
        });
    }

    db.run(
        "INSERT INTO orders (username, total) VALUES (?, ?)",
        [username, total],
        function (err) {

            if (err) {
                return res.status(500).json({
                    message: "Order processing failed"
                });
            }

            res.json({
                message: "Order placed successfully",
                orderId: this.lastID
            });
        }
    );
});


app.get("/api/orders", (req, res) => {

    db.all(
        "SELECT * FROM orders ORDER BY id DESC",
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Unable to get orders"
                });
            }

            res.json(rows);
        }
    );
});


app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});