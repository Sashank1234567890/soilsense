const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.post('/', recommendationController.getRecommendationsAllCrops);
router.post('/crop-specific', recommendationController.getRecommendationCropSpecific);
router.get('/:id', recommendationController.getRecommendationById);
router.get('/soil/:soilTestId', recommendationController.getRecommendationBySoilTestId);

module.exports = router;
