const express = require('express');
const router = express.Router();

const db = require('../config/db');


// ======================
// GET ALL SCHEDULE
// ======================

router.get('/', async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM feeding_schedules ORDER BY time_format ASC"
        );

        res.json(rows);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });

    }

});


// ======================
// ADD NEW SCHEDULE
// ======================

router.post('/', async (req, res) => {

    try {

        const { time } = req.body;

        await db.query(
            "INSERT INTO feeding_schedules (time_format) VALUES (?)",
            [time]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;