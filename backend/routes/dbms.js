const express = require('express');
const router = express.Router();
const dbmsController = require('../controllers/dbmsController');

router.get('/queries', dbmsController.getPredefinedQueries);
router.post('/execute', dbmsController.executeQuery);
router.get('/stats', dbmsController.getDatabaseStats);
router.post('/transaction-demo', dbmsController.executeTransactionDemo);

module.exports = router;
