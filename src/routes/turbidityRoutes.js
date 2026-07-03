const express = require('express');
const router = express.Router();

const TurbidityController = require('../controllers/turbidityController');

// ESP kirim data
router.post('/log', TurbidityController.receiveData);

// Frontend ambil data
router.get('/data', TurbidityController.getData);

// Data terbaru
router.get('/latest', TurbidityController.getLatest);

module.exports = router;
