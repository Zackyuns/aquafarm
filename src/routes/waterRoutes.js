const express = require('express');
const router = express.Router();

const WaterController = require('../controllers/waterController');

// ESP32 kirim data
router.post('/log', WaterController.receiveData);

// Frontend ambil semua data
router.get('/data', WaterController.getData);

// Frontend ambil data terbaru
router.get('/latest', WaterController.getLatest);

// Test route
router.get('/', (req, res) => {
    res.send("Water API Running");
});

module.exports = router;