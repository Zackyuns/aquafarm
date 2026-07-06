const express = require("express");
const router = express.Router();

// Menyimpan data terakhir di memory
let latestWater = {
    waterLevel: 0,
    updatedAt: null
};

// ===============================
// ESP32 KIRIM DATA
// POST /api/water/log
// ===============================
router.post("/log", (req, res) => {

    console.log("DATA WATER MASUK:", req.body);

    latestWater.waterLevel = req.body.value;
    latestWater.updatedAt = new Date();

    res.json({
        success: true,
        message: "Data water level tersimpan",
        data: latestWater
    });

});

// ===============================
// DASHBOARD AMBIL DATA TERBARU
// GET /api/water/latest
// ===============================
router.get("/latest", (req, res) => {

    res.json({
        success: true,
        waterLevel: latestWater.waterLevel,
        updatedAt: latestWater.updatedAt
    });

});

// ===============================
// TEST ROUTE
// GET /api/water
// ===============================
router.get("/", (req, res) => {

    res.send("Water API Running");

});

module.exports = router;