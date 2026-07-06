const express = require("express");
const router = express.Router();

// Menyimpan data terakhir di memory
let latestTurbidity = {
    turbidity: 0,
    updatedAt: null
};

// ===============================
// ESP32 KIRIM DATA
// POST /api/turbidity/log
// ===============================
router.post("/log", (req, res) => {

    console.log("DATA TURBIDITY MASUK:", req.body);

    latestTurbidity.turbidity = req.body.turbidity;
    latestTurbidity.updatedAt = new Date();

    res.json({
        success: true,
        message: "Data turbidity tersimpan",
        data: latestTurbidity
    });

});

// ===============================
// DASHBOARD AMBIL DATA TERBARU
// GET /api/turbidity/latest
// ===============================
router.get("/latest", (req, res) => {

    res.json({
        success: true,
        turbidity: latestTurbidity.turbidity,
        updatedAt: latestTurbidity.updatedAt
    });

});

// ===============================
// DASHBOARD AMBIL DATA
// GET /api/turbidity/data
// ===============================
router.get("/data", (req, res) => {

    res.json({
        success: true,
        data: latestTurbidity
    });

});

// ===============================
// TEST ROUTE
// GET /api/turbidity
// ===============================
router.get("/", (req, res) => {

    res.send("Turbidity API Running");

});

module.exports = router;