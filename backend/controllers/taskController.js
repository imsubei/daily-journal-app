const Task = require('../models/Task');
const Journal = require('../models/Journal');

// @desc    创建新待办事项
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { content, journalId, originalText } = req.body;
    
    // 验证日记是否存在且属于当前用户
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({
        success: false,
        error: '未找到相关日记'
      });
    }
    
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    // 创建待办事项
    const task = await Task.create({
      user: req.user._id,
      journal: journalId,
      content,
      originalText
    });
    
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取用户所有待办事项
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // 支持过滤已完成/未完成
    const filter = { user: req.user._id };
    if (req.query.completed === 'true') {
      filter.completed = true;
    } else if (req.query.completed === 'false') {
      filter.completed = false;
    }
    
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('journal', 'date');
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取单个待办事项
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('journal', 'date content');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '未找到待办事项'
      });
    }
    
    // 确认是用户自己的待办事项
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新待办事项
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { content, completed } = req.body;
    
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '未找到待办事项'
      });
    }
    
    // 确认是用户自己的待办事项
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    // 更新内容
    if (content !== undefined) {
      task.content = content;
    }
    
    // 更新完成状态
    if (completed !== undefined && completed !== task.completed) {
      task.completed = completed;
      if (completed) {
        task.completedAt = Date.now();
      } else {
        task.completedAt = null;
      }
    }
    
    await task.save();
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    删除待办事项
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '未找到待办事项'
      });
    }
    
    // 确认是用户自己的待办事项
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    await task.remove();
    
    res.json({
      success: true,
      message: '待办事项已删除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新提醒状态
// @route   PUT /api/tasks/:id/reminder
// @access  Private
exports.updateReminderStatus = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '未找到待办事项'
      });
    }
    
    // 确认是用户自己的待办事项
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      });
    }
    
    // 更新提醒状态
    task.lastReminderTime = Date.now();
    task.reminderCount += 1;
    
    await task.save();
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
