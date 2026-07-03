const mysql = require('mysql2');
require('dotenv').config();

console.log("DB NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    }

});

// Menggunakan promise wrapper agar bisa pakai async/await
module.exports = pool.promise();