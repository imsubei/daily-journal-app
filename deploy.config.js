// 部署配置文件

module.exports = {
  // 环境变量配置
  env: {
    // 数据库配置
    DATABASE_URL: process.env.DATABASE_URL,
    
    // JWT密钥（用于用户认证）
    JWT_SECRET: process.env.JWT_SECRET,
    
    // 应用URL（用于生成绝对URL）
    APP_URL: process.env.APP_URL || 'https://daily-journal-app.vercel.app',
    
    // API配置
    API_TIMEOUT: process.env.API_TIMEOUT || '10000',
  },
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 是否压缩
    minify: true,
    
    // 是否生成源码映射
    sourcemap: false,
  },
  
  // 部署配置
  deploy: {
    // 部署平台
    platform: 'vercel',
    
    // 区域设置
    regions: ['all'],
    
    // 缓存配置
    cache: {
      // 静态资源缓存时间（秒）
      assets: 31536000, // 1年
      
      // API响应缓存时间（秒）
      api: 0, // 不缓存API响应
    },
  },
  
  // 性能优化
  performance: {
    // 是否启用图片优化
    images: true,
    
    // 是否启用代码分割
    codeSplitting: true,
    
    // 是否启用懒加载
    lazyLoading: true,
  },
  
  // 安全配置
  security: {
    // 内容安全策略
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https://api.deepseek.com'],
    },
    
    // 是否启用HTTPS
    https: true,
    
    // 是否启用HSTS
    hsts: true,
    
    // 是否启用XSS保护
    xss: true,
    
    // 是否启用CSRF保护
    csrf: true,
  },
};
