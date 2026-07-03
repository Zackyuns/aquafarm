const express = require('express');
const router = express.Router();
const DataController = require('../controllers/dataController');

// Route untuk ESP mengirim data (POST)
// Endpoint: /api/feeder/log
router.post('/log', DataController.receiveData);

// Route untuk Frontend mengambil data (GET)
// Endpoint: /api/feeder/data
router.get('/data', DataController.getRealtimeData);

// Route untuk Frontend mengambil data terbaru saja (GET)
// Endpoint: /api/feeder/latest
router.get('/latest', DataController.getLatestData);

// Route untuk Frontend mengambil data berdasarkan ID (GET)
// Endpoint: /api/feeder/data/:id
router.get('/data/:id', DataController.getDataById);

// Ambil Jadwal (GET)
router.get('/schedule', DataController.getSchedule);

// Simpan Jadwal (POST)
router.post('/schedule', DataController.saveSchedule);

let feed = 0;

// Tombol Feed Manual
router.post('/feed', (req, res) => {

    feed = 1;

    res.json({
        success: true
    });

});

// Dibaca ESP32
router.get('/', (req, res) => {

    res.json({
        feed
    });

});

// Reset setelah servo bergerak
router.post('/reset', (req, res) => {

    feed = 0;

    res.json({
        success: true
    });

});

module.exports = router;