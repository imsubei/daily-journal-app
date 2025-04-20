const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  updateApiKey, 
  getApiKey,
  deleteApiKey
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// 保护所有路由
router.use(protect);

// 获取和更新用户设置
router.route('/')
  .get(getSettings)
  .put(updateSettings);

// 管理API密钥
router.route('/api-key')
  .get(getApiKey)
  .put(updateApiKey)
  .delete(deleteApiKey);

module.exports = router;
