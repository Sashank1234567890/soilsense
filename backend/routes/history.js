const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/soil/:plotId', historyController.getPlotSoilHistory);
router.get('/moisture/:deviceId', historyController.getDeviceMoistureHistory);

module.exports = router;
