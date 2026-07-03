const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ambil status
router.get("/status", async(req,res)=>{

    const [rows] =
    await db.query(
        "SELECT * FROM auto_settings LIMIT 1"
    );

    res.json(rows[0]);

});

// update auto drain
router.post("/drain", async(req,res)=>{

    const { enabled } = req.body;

    await db.query(
        "UPDATE auto_settings SET auto_drain=? WHERE id=1",
        [enabled]
    );

    res.json({
        success:true
    });

});

// update auto fill
router.post("/fill", async(req,res)=>{

    const { enabled } = req.body;

    await db.query(
        "UPDATE auto_settings SET auto_fill=? WHERE id=1",
        [enabled]
    );

    res.json({
        success:true
    });

});

module.exports = router;