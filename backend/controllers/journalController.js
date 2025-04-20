const Journal = require('../models/Journal');
const Task = require('../models/Task');

// @desc    创建新日记
// @route   POST /api/journals
// @access  Private
exports.createJournal = async (req, res) => {
  try {
    const { content } = req.body;
    
    // 检查是否已有当天的日记
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingJournal = await Journal.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (existingJournal) {
      // 更新现有日记
      existingJournal.content = content;
      existingJournal.isAnalyzed = false; // 重置分析状态
      await existingJournal.save();
      
      return res.json({
        success: true,
        journal: existingJournal
      });
    }
    
    // 创建新日记
    const journal = await Journal.create({
      user: req.user._id,
      content,
      date: new Date()
    });
    
    res.status(201).json({
      success: true,
      journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取当天日记
// @route   GET /api/journals/today
// @access  Private
exports.getTodayJournal = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const journal = await Journal.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '今日尚未创建日记'
      });
    }
    
    res.json({
      success: true,
      journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新日记
// @route   PUT /api/journals/:id
// @access  Private
exports.updateJournal = async (req, res) => {
  try {
    const { content } = req.body;
    
    let journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '未找到日记'
      });
    }
    
    // 确认是用户自己的日记
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    journal.content = content;
    journal.isAnalyzed = false; // 重置分析状态
    await journal.save();
    
    res.json({
      success: true,
      journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取用户所有日记
// @route   GET /api/journals
// @access  Private
exports.getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ date: -1 });
    
    res.json({
      success: true,
      count: journals.length,
      journals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取单个日记
// @route   GET /api/journals/:id
// @access  Private
exports.getJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '未找到日记'
      });
    }
    
    // 确认是用户自己的日记
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    res.json({
      success: true,
      journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    删除日记
// @route   DELETE /api/journals/:id
// @access  Private
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '未找到日记'
      });
    }
    
    // 确认是用户自己的日记
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    // 删除相关的待办事项
    await Task.deleteMany({ journal: journal._id });
    
    // 删除日记
    await journal.remove();
    
    res.json({
      success: true,
      message: '日记已删除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新日记的AI分析结果
// @route   PUT /api/journals/:id/analysis
// @access  Private
exports.updateJournalAnalysis = async (req, res) => {
  try {
    const { theme, evaluation, thoughtProcess, sentiment, depth } = req.body;
    
    let journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '未找到日记'
      });
    }
    
    // 确认是用户自己的日记
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    journal.aiAnalysis = {
      theme: theme || journal.aiAnalysis.theme,
      evaluation: evaluation || journal.aiAnalysis.evaluation,
      thoughtProcess: thoughtProcess || journal.aiAnalysis.thoughtProcess,
      sentiment: sentiment || journal.aiAnalysis.sentiment,
      depth: depth || journal.aiAnalysis.depth
    };
    
    journal.isAnalyzed = true;
    await journal.save();
    
    res.json({
      success: true,
      journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取周报数据
// @route   GET /api/journals/weekly-report
// @access  Private
exports.getWeeklyReport = async (req, res) => {
  try {
    // 获取一周前的日期
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    // 获取本周的日记
    const journals = await Journal.find({
      user: req.user._id,
      date: { $gte: oneWeekAgo }
    }).sort({ date: 1 });
    
    // 获取本周完成的任务
    const completedTasks = await Task.find({
      user: req.user._id,
      completed: true,
      completedAt: { $gte: oneWeekAgo }
    });
    
    // 统计主题
    const themes = journals
      .filter(journal => journal.aiAnalysis && journal.aiAnalysis.theme)
      .map(journal => journal.aiAnalysis.theme);
    
    // 统计情感
    const sentiments = journals
      .filter(journal => journal.aiAnalysis && journal.aiAnalysis.sentiment)
      .reduce((acc, journal) => {
        const sentiment = journal.aiAnalysis.sentiment;
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {});
    
    res.json({
      success: true,
      report: {
        journalCount: journals.length,
        completedTaskCount: completedTasks.length,
        themes,
        sentiments,
        startDate: oneWeekAgo,
        endDate: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
