const db = require('../config/db');

const WaterModel = {

    async createLog(value) {

        const query = `
            INSERT INTO water_level_logs (value)
            VALUES (?)
        `;

        const [result] = await db.execute(query, [value]);

        return result;

    },

    async getRecent(limit = 10) {

        const query = `
            SELECT *
            FROM water_level_logs
            ORDER BY created_at DESC
            LIMIT ?
        `;

        const [rows] = await db.execute(query, [parseInt(limit)]);

        return rows;

    },

    async getLatest() {

        const query = `
            SELECT *
            FROM water_level_logs
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [rows] = await db.execute(query);

        return rows[0] || null;

    }

};

module.exports = WaterModel;