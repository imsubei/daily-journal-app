const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  journal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journal',
    required: true
  },
  content: {
    type: String,
    required: [true, '待办事项内容不能为空']
  },
  originalText: {
    type: String,
    required: [true, '原始文本不能为空']
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastReminderTime: {
    type: Date,
    default: null
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Task', TaskSchema);
