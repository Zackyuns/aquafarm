const mysql = require("mysql2");
require("dotenv").config();

console.log("HOST :", process.env.DB_HOST);
console.log("PORT :", process.env.DB_PORT);
console.log("USER :", process.env.DB_USER);
console.log("DB   :", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
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

module.exports = pool.promise();