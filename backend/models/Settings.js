const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  deepseekApiKey: {
    type: String,
    default: '',
    select: false // 保护API密钥不被默认查询返回
  },
  reminderInterval: {
    type: Number,
    default: 20, // 默认20分钟提醒一次
    min: 5,
    max: 120
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  emailNotifications: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
