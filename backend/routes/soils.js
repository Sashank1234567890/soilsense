const express = require('express');
const router = express.Router();
const soilController = require('../controllers/soilController');
const { protect } = require('../middleware/auth');

router.get('/soil-types/search', soilController.searchSoilTypes);
router.get('/soil-types', soilController.getAllSoilTypes);
router.get('/soil-types/:id', soilController.getSoilTypeById);
router.get('/soil-profiles', soilController.getAllSoilProfiles);

router.post('/soil-tests', protect, soilController.createSoilTest);
router.get('/soil-tests', protect, soilController.getAllSoilTests);
router.get('/soil-tests/:id', protect, soilController.getSoilTestById);
router.post('/soil/analyse', protect, soilController.analyseSoil);
router.post('/soil/classify', protect, soilController.classifySoilEndpoint);
router.post('/soil/compare', protect, soilController.compareSoilProfiles);

module.exports = router;
