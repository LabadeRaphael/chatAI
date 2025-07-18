// server/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected chat route
router.post('/', authMiddleware, chatController.sendMessage);
router.get('/history', authMiddleware, chatController.getMessages);
router.get('/title', authMiddleware, chatController.getChatTitles);

module.exports = router;
