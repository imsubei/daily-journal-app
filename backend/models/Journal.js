const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, '日记内容不能为空']
  },
  date: {
    type: Date,
    default: Date.now
  },
  aiAnalysis: {
    theme: {
      type: String,
      default: ''
    },
    evaluation: {
      type: String,
      default: ''
    },
    thoughtProcess: {
      type: String,
      default: ''
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', ''],
      default: ''
    },
    depth: {
      type: String,
      enum: ['shallow', 'moderate', 'deep', ''],
      default: ''
    }
  },
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
JournalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Journal', JournalSchema);
