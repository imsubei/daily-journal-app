const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// 用户注册
router.post('/register', registerUser);

// 用户登录
router.post('/login', loginUser);

// 获取当前用户信息
router.get('/me', protect, getCurrentUser);

module.exports = router;
