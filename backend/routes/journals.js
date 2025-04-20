const express = require('express');
const router = express.Router();
const { 
  createJournal, 
  getTodayJournal, 
  updateJournal, 
  getJournals, 
  getJournal, 
  deleteJournal, 
  updateJournalAnalysis,
  getWeeklyReport
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// 保护所有路由
router.use(protect);

// 获取周报
router.get('/weekly-report', getWeeklyReport);

// 获取今日日记
router.get('/today', getTodayJournal);

// 创建和获取所有日记
router.route('/')
  .post(createJournal)
  .get(getJournals);

// 获取、更新和删除单个日记
router.route('/:id')
  .get(getJournal)
  .put(updateJournal)
  .delete(deleteJournal);

// 更新日记分析结果
router.put('/:id/analysis', updateJournalAnalysis);

module.exports = router;
