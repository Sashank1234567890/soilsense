const express = require('express');
const router = express.Router();
const advisoryCtrl = require('../controllers/advisoryController');

router.get('/irrigation', advisoryCtrl.getIrrigationAdvisory);
router.get('/fertilizer', advisoryCtrl.getFertilizerPrescription);
router.get('/disease-risk', advisoryCtrl.getDiseaseRisk);
router.get('/market-roi', advisoryCtrl.getMarketROI);
router.post('/soil-health-card', advisoryCtrl.createSoilHealthCard);
router.get('/weather', advisoryCtrl.getWeatherForecast);
router.get('/season-check', advisoryCtrl.checkSeasonSuitability);
router.get('/devices', advisoryCtrl.getAvailableDevices);
router.get('/crop-schedule', advisoryCtrl.getCropScheduleAndAlerts);
router.post('/crop-schedule', advisoryCtrl.updateCropSchedule);
router.post('/crop-harvest', advisoryCtrl.harvestCrop);
router.post('/update-location', advisoryCtrl.updateLocation);

// Multi-Farm & Multi-Crop Management Routes
router.get('/farms', advisoryCtrl.getAllFarms);
router.post('/farms', advisoryCtrl.addFarm);
router.post('/farm-notifications', advisoryCtrl.updateNotifications);
router.delete('/farms/:plotId', advisoryCtrl.removeFarm);

module.exports = router;
