const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Unified Ingestion Pipeline
router.post('/sensor/readings', iotController.ingestReading);
router.get('/sensor/latest/:deviceId', iotController.getLatestReadingByDevice);
router.get('/iot/status', iotController.getIoTSystemStatus);

// Devices
router.get('/devices', iotController.getAllDevices);
router.post('/devices', iotController.createDevice);
router.get('/devices/:id', iotController.getDeviceById);
router.get('/devices/:id/readings', iotController.getDeviceReadings);

// Alerts
router.get('/alerts', iotController.getAlerts);

module.exports = router;
