const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  updateReminderStatus
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// 保护所有路由
router.use(protect);

// 创建和获取所有待办事项
router.route('/')
  .post(createTask)
  .get(getTasks);

// 获取、更新和删除单个待办事项
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// 更新提醒状态
router.put('/:id/reminder', updateReminderStatus);

module.exports = router;
