# 每日随记与反拖延网站 - 开发文档

## 项目架构

本项目采用前后端分离的架构，主要组件如下：

### 前端
- **框架**：React.js + Next.js
- **样式**：Tailwind CSS
- **状态管理**：React Context API
- **HTTP客户端**：Axios

### 后端
- **框架**：Node.js + Express
- **数据库**：MongoDB + Mongoose
- **认证**：JWT (JSON Web Tokens)
- **AI集成**：DeepSeek API

## 目录结构

```
daily-journal-app/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── app/             # Next.js应用目录
│   │   │   ├── components/  # 可复用组件
│   │   │   ├── contexts/    # React上下文
│   │   │   ├── hooks/       # 自定义钩子
│   │   │   ├── services/    # API服务
│   │   │   ├── utils/       # 工具函数
│   │   │   ├── login/       # 登录页面
│   │   │   ├── history/     # 历史记录页面
│   │   │   ├── settings/    # 设置页面
│   │   │   ├── tasks/       # 待办事项页面
│   │   │   ├── layout.js    # 应用布局
│   │   │   └── page.js      # 主页（日记编辑页）
│   ├── public/              # 静态资源
│   ├── next.config.js       # Next.js配置
│   └── package.json         # 依赖管理
│
├── backend/                 # 后端项目
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由定义
│   ├── services/            # 服务层
│   ├── server.js            # 服务器入口
│   └── package.json         # 依赖管理
│
├── user_manual.md           # 用户手册
└── developer_guide.md       # 开发者指南
```

## 数据模型

### 用户模型 (User)
```javascript
{
  username: String,
  email: String,
  password: String (加密存储),
  createdAt: Date,
  updatedAt: Date
}
```

### 日记模型 (Journal)
```javascript
{
  user: ObjectId (关联User),
  content: String,
  date: Date,
  isAnalyzed: Boolean,
  aiAnalysis: {
    theme: String,
    evaluation: String,
    thoughtProcess: String,
    sentiment: String,
    depth: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 待办事项模型 (Task)
```javascript
{
  user: ObjectId (关联User),
  journal: ObjectId (关联Journal),
  content: String,
  originalText: String,
  completed: Boolean,
  completedAt: Date,
  reminderCount: Number,
  lastReminderTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 设置模型 (Settings)
```javascript
{
  user: ObjectId (关联User),
  deepseekApiKey: String (加密存储),
  hasApiKey: Boolean,
  reminderInterval: Number,
  theme: String,
  emailNotifications: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API端点

### 用户认证
- `POST /api/users/register` - 注册新用户
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息

### 日记管理
- `GET /api/journals` - 获取所有日记
- `GET /api/journals/today` - 获取今日日记
- `GET /api/journals/:id` - 获取特定日记
- `POST /api/journals` - 创建新日记
- `PUT /api/journals/:id` - 更新日记
- `DELETE /api/journals/:id` - 删除日记

### 待办事项管理
- `GET /api/tasks` - 获取所有待办事项
- `GET /api/tasks/:id` - 获取特定待办事项
- `POST /api/tasks` - 创建新待办事项
- `PUT /api/tasks/:id` - 更新待办事项
- `PUT /api/tasks/:id/reminder` - 更新提醒状态
- `DELETE /api/tasks/:id` - 删除待办事项

### 设置管理
- `GET /api/settings` - 获取用户设置
- `PUT /api/settings` - 更新用户设置
- `PUT /api/settings/api-key` - 更新API密钥
- `DELETE /api/settings/api-key` - 删除API密钥

### DeepSeek API集成
- `POST /api/deepseek/analyze` - 分析日记内容
- `POST /api/deepseek/extract-tasks` - 提取待办事项
- `POST /api/deepseek/weekly-report` - 生成周报

## 前端组件

### 上下文提供者
- `AuthContext` - 管理用户认证状态
- `JournalContext` - 管理日记数据
- `TaskContext` - 管理待办事项
- `SettingsContext` - 管理用户设置

### 主要组件
- `ReminderSystem` - 待办事项提醒系统
- `TaskExtractor` - 待办事项提取器
- `JournalEditor` - 日记编辑器
- `AnalysisDisplay` - AI分析结果展示

## 安全考虑

1. **用户认证**
   - 使用JWT进行身份验证
   - 密码使用bcrypt加密存储
   - 所有敏感API端点都有认证中间件保护

2. **数据安全**
   - DeepSeek API密钥加密存储
   - 所有用户数据默认私有
   - 使用HTTPS保护数据传输

3. **错误处理**
   - 服务器端错误日志记录
   - 客户端友好错误消息
   - API错误统一格式返回

## 部署指南

### 后端部署
1. 安装Node.js和MongoDB
2. 克隆代码库
3. 在backend目录运行`npm install`
4. 创建`.env`文件配置环境变量
5. 运行`npm start`或使用PM2启动服务

### 前端部署
1. 在frontend目录运行`npm install`
2. 配置`next.config.js`中的API地址
3. 运行`npm run build`构建生产版本
4. 使用`npm start`启动服务或部署到静态文件服务器

## 维护与扩展

### 添加新功能
1. 在相应的模型中添加新字段
2. 更新控制器和路由
3. 在前端添加新组件和服务
4. 更新上下文提供者

### 性能优化
1. 添加数据库索引
2. 实现API响应缓存
3. 优化前端组件渲染
4. 使用CDN加速静态资源

### 故障排除
1. 检查服务器日志
2. 验证数据库连接
3. 测试API端点
4. 检查前端控制台错误

## 测试

### 后端测试
- 使用`test.js`脚本测试API端点
- 验证数据模型和业务逻辑

### 前端测试
- 测试用户界面和交互
- 验证与后端API的集成
- 测试响应式布局

## 未来改进

1. 添加社交分享功能
2. 实现数据导出和备份
3. 添加更多AI分析维度
4. 实现移动应用版本
5. 添加多语言支持

## 技术债务

1. 优化错误处理机制
2. 改进前端状态管理
3. 增加单元测试覆盖率
4. 优化移动端性能

## 联系方式

如有任何技术问题，请联系项目维护者：

- 邮箱：developer@dailyjournal.example.com
- GitHub: github.com/example/daily-journal-app
