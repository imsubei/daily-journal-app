const Settings = require('../models/Settings');

// @desc    获取或创建用户设置
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    
    // 如果设置不存在，创建默认设置
    if (!settings) {
      settings = await Settings.create({
        user: req.user._id
      });
    }
    
    res.json({
      success: true,
      settings: {
        reminderInterval: settings.reminderInterval,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications,
        hasApiKey: settings.deepseekApiKey ? true : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新用户设置
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { reminderInterval, theme, emailNotifications } = req.body;
    
    let settings = await Settings.findOne({ user: req.user._id });
    
    // 如果设置不存在，创建默认设置
    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        reminderInterval: reminderInterval || 20,
        theme: theme || 'system',
        emailNotifications: emailNotifications || false
      });
    } else {
      // 更新设置
      if (reminderInterval !== undefined) {
        settings.reminderInterval = reminderInterval;
      }
      
      if (theme !== undefined) {
        settings.theme = theme;
      }
      
      if (emailNotifications !== undefined) {
        settings.emailNotifications = emailNotifications;
      }
      
      await settings.save();
    }
    
    res.json({
      success: true,
      settings: {
        reminderInterval: settings.reminderInterval,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications,
        hasApiKey: settings.deepseekApiKey ? true : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    更新DeepSeek API密钥
// @route   PUT /api/settings/api-key
// @access  Private
exports.updateApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API密钥不能为空'
      });
    }
    
    let settings = await Settings.findOne({ user: req.user._id });
    
    // 如果设置不存在，创建默认设置
    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        deepseekApiKey: apiKey
      });
    } else {
      // 更新API密钥
      settings.deepseekApiKey = apiKey;
      await settings.save();
    }
    
    res.json({
      success: true,
      message: 'API密钥已更新'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    获取DeepSeek API密钥
// @route   GET /api/settings/api-key
// @access  Private
exports.getApiKey = async (req, res) => {
  try {
    const settings = await Settings.findOne({ user: req.user._id }).select('+deepseekApiKey');
    
    if (!settings || !settings.deepseekApiKey) {
      return res.status(404).json({
        success: false,
        error: '未设置API密钥'
      });
    }
    
    res.json({
      success: true,
      apiKey: settings.deepseekApiKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    删除DeepSeek API密钥
// @route   DELETE /api/settings/api-key
// @access  Private
exports.deleteApiKey = async (req, res) => {
  try {
    const settings = await Settings.findOne({ user: req.user._id });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: '未找到设置'
      });
    }
    
    settings.deepseekApiKey = '';
    await settings.save();
    
    res.json({
      success: true,
      message: 'API密钥已删除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
