const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');
const { protect } = require('../middleware/auth');

// Unified Ingestion Pipeline
router.post('/sensor/readings', iotController.ingestReading);
router.get('/sensor/latest/:deviceId', iotController.getLatestReadingByDevice);
router.get('/iot/status', iotController.getIoTSystemStatus);

// Devices
router.get('/devices', iotController.getAllDevices);
router.post('/devices', iotController.createDevice);
router.get('/devices/:id', iotController.getDeviceById);
router.get('/devices/:id/readings', iotController.getDeviceReadings);

// User Scoped Alerts (No dummy data, isolated per user with delete support)
router.get('/alerts', protect, iotController.getAlerts);
router.post('/alerts', protect, iotController.createAlert);
router.delete('/alerts/:id', protect, iotController.deleteAlert);

module.exports = router;
