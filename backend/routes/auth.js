const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/demo-switch', authController.demoSwitch);
router.get('/accounts', authController.getAllAccounts);
router.post('/switch-account', authController.switchAccount);
router.delete('/accounts/:id', authController.deleteAccount);
router.post('/delete-account', authController.deleteAccount);

module.exports = router;
