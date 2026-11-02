
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors')

dotenv.config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((error) => {
    if (error) {
        console.error("MySQL connection failed:", error.message);
        return;
    }

    console.log("Connected to MySQL database!");
});

const app = express();
const PORT = 3000;

//middleware
app.use(express.json());
app.use(cors());


//test route
app.get('/', (req, res) => {

    res.send('Backend Server is running!');

});

// Get all products
app.get("/api/products", (req, res) => {
    const sql = `
        SELECT *
        FROM products
        JOIN shop_categories
            ON products.product_id = shop_categories.product_id
        JOIN displayed_characteristics
            ON products.product_id = displayed_characteristics.characteristic_id;
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Products query failed:", error);
            return res.status(500).json({
                message: "Database error."
            });
        }

        res.json(results);
    });
});

// Get a product by ID 
app.get("/api/products/:id", (req, res) => {
    const productId = req.params.id;

    const sql = "SELECT * FROM products WHERE product_id = ?";

    db.query(sql, [productId], (error, results) => {
        if (error) {
            console.error("Product query failed:", error);
            return res.status(500).json({
                message: "Database error."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        const product = results[0];

        const attributeSql = `
            SELECT attribute_name, attribute_value
            FROM product_attributes
            WHERE product_id = ?
        `;

        db.query(attributeSql, [productId], (attributeError, attributes) => {
            if (attributeError) {
                console.error("Attribute query failed:", attributeError);
                return res.status(500).json({
                    message: "Failed to retrieve product attributes."
                });
            }

            product.attributes = attributes;

            res.json(product);
        });
    });
});

//start server
app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});