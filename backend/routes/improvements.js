const express = require('express');
const router = express.Router();
const improvementController = require('../controllers/improvementController');

router.post('/', improvementController.createImprovementPlan);
router.get('/:id', improvementController.getImprovementPlanById);
router.get('/soil/:soilTestId', improvementController.getImprovementPlanBySoilTestId);

module.exports = router;
