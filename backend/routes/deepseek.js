const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const deepseekService = require('../services/deepseekService');

// 保护所有路由
router.use(protect);

// 分析日记内容
router.post('/analyze', async (req, res) => {
  try {
    const { content, journalId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '内容不能为空'
      });
    }
    
    const analysisResult = await deepseekService.analyzeJournal(req.user._id, content);
    
    res.json({
      success: true,
      result: analysisResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 提取待办事项
router.post('/extract-tasks', async (req, res) => {
  try {
    const { content, journalId } = req.body;
    
    if (!content || !journalId) {
      return res.status(400).json({
        success: false,
        error: '内容和日记ID不能为空'
      });
    }
    
    const tasks = await deepseekService.extractTasks(req.user._id, content, journalId);
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 生成周报
router.post('/weekly-report', async (req, res) => {
  try {
    const { journals, completedTasks } = req.body;
    
    if (!journals || !completedTasks) {
      return res.status(400).json({
        success: false,
        error: '日记和已完成任务数据不能为空'
      });
    }
    
    const report = await deepseekService.generateWeeklyReport(req.user._id, journals, completedTasks);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
