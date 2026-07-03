const db = require('../config/db');

const TurbidityModel = {

    async createLog(value) {
        const query = `
            INSERT INTO turbidity_logs (turbidity)
            VALUES (?)
        `;
        const [result] = await db.execute(query, [value]);
        return result;
    },

    async getRecent(limit = 10) {
        const query = `
            SELECT * FROM turbidity_logs
            ORDER BY created_at DESC
            LIMIT ?
        `;
        const [rows] = await db.execute(query, [parseInt(limit)]);
        return rows;
    },

    async getLatest() {
        const query = `
            SELECT * FROM turbidity_logs
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const [rows] = await db.execute(query);
        return rows[0] || null;
    }

};

module.exports = TurbidityModel;
