// 测试脚本：检查所有主要功能

// 导入必要的测试库
const { test, expect } = require('@playwright/test');

// 测试用户认证功能
test.describe('认证功能测试', () => {
  test('用户注册流程', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register');
    
    // 填写注册表单
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证是否重定向到登录页面
    await expect(page).toHaveURL('/login');
  });

  test('用户登录流程', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    
    // 填写登录表单
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证是否重定向到仪表盘
    await expect(page).toHaveURL('/dashboard');
  });
});

// 测试日记功能
test.describe('日记功能测试', () => {
  test('创建新日记', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问新建日记页面
    await page.goto('/journal/new');
    
    // 填写日记内容
    await page.fill('textarea', '今天是个好日子，我计划要完成项目测试。');
    
    // 保存日记
    await page.click('button:has-text("保存")');
    
    // 验证是否保存成功（URL应该变为/journal/[id]）
    await expect(page.url()).toMatch(/\/journal\/\d+/);
  });

  test('编辑现有日记', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问仪表盘
    await page.goto('/dashboard');
    
    // 点击第一篇日记
    await page.click('.journal-item:first-child a');
    
    // 编辑日记内容
    await page.fill('textarea', '更新后的日记内容，我今天要完成所有测试。');
    
    // 保存日记
    await page.click('button:has-text("保存")');
    
    // 验证是否显示保存成功的提示
    await expect(page.locator('text=上次保存')).toBeVisible();
  });
});

// 测试AI分析功能
test.describe('AI分析功能测试', () => {
  test('分析日记内容', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问仪表盘
    await page.goto('/dashboard');
    
    // 点击第一篇日记
    await page.click('.journal-item:first-child a');
    
    // 设置API密钥（如果需要）
    await page.goto('/settings/apikey');
    await page.fill('input[name="apiKey"]', 'test_api_key');
    await page.click('button:has-text("保存")');
    
    // 返回日记页面
    await page.goBack();
    await page.goBack();
    
    // 点击AI分析按钮
    await page.click('button:has-text("AI 分析内容")');
    
    // 验证是否显示分析结果（可能需要等待一段时间）
    await expect(page.locator('text=情绪:')).toBeVisible({ timeout: 10000 });
  });
});

// 测试任务功能
test.describe('任务功能测试', () => {
  test('识别任务', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问仪表盘
    await page.goto('/dashboard');
    
    // 点击第一篇日记
    await page.click('.journal-item:first-child a');
    
    // 点击识别任务按钮
    await page.click('button:has-text("识别计划任务")');
    
    // 验证是否显示任务识别成功的提示
    await expect(page.locator('text=成功识别')).toBeVisible({ timeout: 10000 });
  });

  test('查看和完成任务', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问任务页面
    await page.goto('/tasks');
    
    // 验证是否显示任务列表
    await expect(page.locator('h1:has-text("我的任务")')).toBeVisible();
    
    // 如果有任务，标记第一个任务为完成
    const hasTask = await page.locator('.task-item').count() > 0;
    if (hasTask) {
      await page.click('.task-item:first-child input[type="checkbox"]');
      
      // 验证任务状态是否更新
      await expect(page.locator('.task-item:first-child .task-status-completed')).toBeVisible();
    }
  });
});

// 测试统计功能
test.describe('统计功能测试', () => {
  test('查看统计数据', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问统计页面
    await page.goto('/stats');
    
    // 验证是否显示统计数据
    await expect(page.locator('h1:has-text("数据统计")')).toBeVisible();
  });

  test('生成每周摘要', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问统计页面
    await page.goto('/stats');
    
    // 点击生成每周摘要按钮
    await page.click('button:has-text("生成每周摘要")');
    
    // 验证是否重定向到每周摘要页面
    await expect(page).toHaveURL('/stats/weekly-summary');
  });
});

// 测试响应式设计
test.describe('响应式设计测试', () => {
  test('移动端导航菜单', async ({ page }) => {
    // 设置视口大小为移动设备尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 访问首页
    await page.goto('/');
    
    // 验证汉堡菜单按钮是否可见
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // 点击汉堡菜单按钮
    await page.click('.mobile-menu');
    
    // 验证导航菜单是否展开
    await expect(page.locator('.mobile-menu-open')).toBeVisible();
  });

  test('桌面端导航栏', async ({ page }) => {
    // 设置视口大小为桌面设备尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 访问首页
    await page.goto('/');
    
    // 验证导航链接是否直接可见
    await expect(page.locator('.navbar-nav')).toBeVisible();
    
    // 验证汉堡菜单按钮是否隐藏
    await expect(page.locator('.mobile-menu')).toBeHidden();
  });
});
