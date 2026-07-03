const db = require('../config/db');

const RelayModel = {

    async getStatus() {
        const query = `SELECT * FROM relay_status LIMIT 1`;
        const [rows] = await db.execute(query);
        return rows[0];
    },

    async setStatus(status) {
        const query = `
            UPDATE relay_status
            SET status = ?
            WHERE id = 1
        `;
        const [result] = await db.execute(query, [status]);
        return result;
    }

};

module.exports = RelayModel;
