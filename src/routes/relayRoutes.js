const express = require('express');
const router = express.Router();

const RelayController = require('../controllers/relayController');

router.get('/status', RelayController.getStatus);

router.post('/on', RelayController.turnOn);

router.post('/off', RelayController.turnOff);

/**
 * AUTO CONTROL ROUTES
 */
router.post('/feed', RelayController.feedNow);
router.post('/drain', RelayController.drainNow);

module.exports = router;
