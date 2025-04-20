// 安全测试脚本

// 导入必要的测试库
const { test, expect } = require('@playwright/test');

// 测试用户认证安全性
test.describe('认证安全测试', () => {
  test('密码强度验证', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register');
    
    // 测试弱密码
    await page.fill('input[name="username"]', 'securitytest');
    await page.fill('input[name="email"]', 'security@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证是否显示密码强度错误提示
    await expect(page.locator('text=密码必须至少包含')).toBeVisible();
  });

  test('防止未授权访问', async ({ page }) => {
    // 尝试直接访问需要认证的页面
    await page.goto('/dashboard');
    
    // 验证是否重定向到登录页面
    await expect(page).toHaveURL('/login');
  });
});

// 测试API密钥安全性
test.describe('API密钥安全测试', () => {
  test('API密钥存储安全性', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问API密钥设置页面
    await page.goto('/settings/apikey');
    
    // 填写API密钥
    await page.fill('input[name="apiKey"]', 'test_api_key_security');
    await page.click('button:has-text("保存")');
    
    // 刷新页面
    await page.reload();
    
    // 验证API密钥是否被掩码显示（不应该明文显示完整密钥）
    const apiKeyField = await page.locator('input[name="apiKey"]');
    const apiKeyValue = await apiKeyField.inputValue();
    expect(apiKeyValue).not.toEqual('test_api_key_security');
  });
});

// 测试CSRF保护
test.describe('CSRF保护测试', () => {
  test('API请求包含CSRF保护', async ({ page, request }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 获取cookies
    const cookies = await page.context().cookies();
    
    // 尝试直接调用API而不包含正确的头信息
    const response = await request.post('/api/journal', {
      data: { content: 'Test content' }
    });
    
    // 验证请求是否被拒绝（应该返回401或403）
    expect(response.status()).toBeOneOf([401, 403]);
  });
});

// 测试XSS防护
test.describe('XSS防护测试', () => {
  test('防止XSS攻击', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 访问新建日记页面
    await page.goto('/journal/new');
    
    // 尝试插入恶意脚本
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('textarea', xssPayload);
    
    // 保存日记
    await page.click('button:has-text("保存")');
    
    // 等待保存完成
    await page.waitForSelector('text=上次保存');
    
    // 验证脚本是否被转义而不是执行
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    expect(pageContent).toContain('&lt;script&gt;');
  });
});

// 测试数据隐私保护
test.describe('数据隐私保护测试', () => {
  test('用户只能访问自己的数据', async ({ browser }) => {
    // 创建两个用户的上下文
    const user1Context = await browser.newContext();
    const user2Context = await browser.newContext();
    
    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();
    
    // 用户1登录并创建日记
    await user1Page.goto('/login');
    await user1Page.fill('input[name="email"]', 'user1@example.com');
    await user1Page.fill('input[name="password"]', 'Password123!');
    await user1Page.click('button[type="submit"]');
    
    await user1Page.goto('/journal/new');
    await user1Page.fill('textarea', '用户1的私密日记');
    await user1Page.click('button:has-text("保存")');
    
    // 获取日记URL
    const journalUrl = user1Page.url();
    
    // 用户2登录并尝试访问用户1的日记
    await user2Page.goto('/login');
    await user2Page.fill('input[name="email"]', 'user2@example.com');
    await user2Page.fill('input[name="password"]', 'Password123!');
    await user2Page.click('button[type="submit"]');
    
    await user2Page.goto(journalUrl);
    
    // 验证用户2是否被拒绝访问用户1的日记
    await expect(user2Page.locator('text=日记不存在或无权访问')).toBeVisible();
  });
});
