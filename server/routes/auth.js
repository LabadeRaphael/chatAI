// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logoutUser);
router.get('/dashboard',authMiddleware, authController.userDetails);
router.get('/search', authMiddleware, authController.searchMessage);

module.exports = router;