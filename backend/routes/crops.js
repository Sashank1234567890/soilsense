const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

router.get('/search', cropController.searchCrops);
router.get('/', cropController.getAllCrops);
router.get('/:id', cropController.getCropById);
router.post('/', cropController.createCrop);
router.put('/:id', cropController.updateCrop);

module.exports = router;
