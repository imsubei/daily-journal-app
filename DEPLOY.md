# 部署指南

本文档提供了将"每日随记与反拖延"应用部署到Vercel的详细步骤。

## 准备工作

1. 确保你有一个Vercel账户。如果没有，请前往 [Vercel官网](https://vercel.com) 注册。
2. 确保你有一个GitHub账户，并已将项目代码推送到GitHub仓库。
3. 准备好以下环境变量：
   - `DATABASE_URL`: 数据库连接字符串
   - `JWT_SECRET`: 用于JWT认证的密钥
   - `APP_URL`: 应用的URL（可选，默认为Vercel分配的域名）

## 部署步骤

### 1. 连接GitHub仓库

1. 登录Vercel账户
2. 点击"New Project"按钮
3. 从GitHub导入仓库
4. 选择包含"每日随记与反拖延"应用的仓库

### 2. 配置项目

1. 项目名称：输入你想要的项目名称，例如"daily-journal-app"
2. 框架预设：选择"Next.js"
3. 根目录：保持默认（如果项目在仓库根目录）

### 3. 环境变量设置

在部署配置页面，添加以下环境变量：

- `DATABASE_URL`: 设置为你的数据库连接字符串
- `JWT_SECRET`: 设置为一个安全的随机字符串
- `APP_URL`: 设置为你的应用URL（可选）

### 4. 部署设置

1. 构建命令：`npm run build`
2. 输出目录：`.next`
3. 安装命令：`npm install`

### 5. 完成部署

点击"Deploy"按钮开始部署过程。Vercel将自动构建和部署你的应用。

### 6. 验证部署

部署完成后，Vercel会提供一个URL。访问该URL确认应用是否正常运行。

## 数据库迁移

首次部署后，需要运行数据库迁移：

1. 在Vercel控制台中，进入你的项目
2. 点击"Deployments"标签
3. 找到最新的部署，点击"..."按钮
4. 选择"Run Command"
5. 输入命令：`npx wrangler d1 execute DB --file=migrations/0001_initial.sql`
6. 点击"Run"按钮

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在Vercel项目页面，点击"Settings"
2. 点击"Domains"
3. 添加你的自定义域名
4. 按照Vercel提供的说明配置DNS记录

## 持续部署

设置完成后，每当你推送代码到GitHub仓库的主分支，Vercel将自动重新构建和部署你的应用。

## 故障排除

如果部署过程中遇到问题：

1. 检查Vercel构建日志，查找错误信息
2. 确保所有环境变量都已正确设置
3. 验证数据库连接是否正常
4. 检查项目依赖是否完整

如需更多帮助，请参考[Vercel文档](https://vercel.com/docs)或联系Vercel支持团队。
