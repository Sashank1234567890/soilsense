const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.post('/', reportController.createReport);
router.get('/', protect, reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.get('/:id/pdf', reportController.downloadReportPDF);

module.exports = router;
