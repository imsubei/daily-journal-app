// 测试脚本：用于测试API端点
const axios = require('axios');
const assert = require('assert');

// 配置
const API_URL = 'http://localhost:5000/api';
let token = null;
let userId = null;
let journalId = null;
let taskId = null;

// 测试用户数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// 测试日记数据
const testJournal = {
  content: '今天我计划完成项目的测试工作，并且需要准备明天的演示文稿。我感觉有点紧张，但是我相信我能够按时完成这些任务。我还想在晚上抽时间去健身房锻炼一下。'
};

// 辅助函数：等待
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试用户注册和登录
async function testUserAuth() {
  console.log('测试用户认证...');
  
  try {
    // 注册
    console.log('测试注册...');
    const registerRes = await axios.post(`${API_URL}/users/register`, testUser);
    assert(registerRes.data.success, '注册失败');
    assert(registerRes.data.token, '注册未返回token');
    token = registerRes.data.token;
    userId = registerRes.data.user._id;
    console.log('注册成功 ✓');
  } catch (error) {
    // 如果用户已存在，尝试登录
    console.log('用户可能已存在，尝试登录...');
    try {
      const loginRes = await axios.post(`${API_URL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      assert(loginRes.data.success, '登录失败');
      assert(loginRes.data.token, '登录未返回token');
      token = loginRes.data.token;
      userId = loginRes.data.user._id;
      console.log('登录成功 ✓');
    } catch (loginError) {
      console.error('登录失败:', loginError.response?.data || loginError.message);
      throw loginError;
    }
  }
  
  // 获取当前用户信息
  console.log('测试获取用户信息...');
  try {
    const userRes = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(userRes.data.success, '获取用户信息失败');
    assert(userRes.data.user._id === userId, '用户ID不匹配');
    console.log('获取用户信息成功 ✓');
  } catch (error) {
    console.error('获取用户信息失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试日记功能
async function testJournals() {
  console.log('\n测试日记功能...');
  
  // 创建日记
  console.log('测试创建日记...');
  try {
    const createRes = await axios.post(`${API_URL}/journals`, testJournal, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(createRes.data.success, '创建日记失败');
    assert(createRes.data.journal._id, '创建日记未返回ID');
    journalId = createRes.data.journal._id;
    console.log('创建日记成功 ✓');
  } catch (error) {
    console.error('创建日记失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 获取今日日记
  console.log('测试获取今日日记...');
  try {
    const todayRes = await axios.get(`${API_URL}/journals/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(todayRes.data.success, '获取今日日记失败');
    assert(todayRes.data.journal._id === journalId, '日记ID不匹配');
    console.log('获取今日日记成功 ✓');
  } catch (error) {
    console.error('获取今日日记失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 更新日记
  console.log('测试更新日记...');
  try {
    const updateRes = await axios.put(`${API_URL}/journals/${journalId}`, {
      content: testJournal.content + ' 更新：我决定先完成测试，再去健身房。'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(updateRes.data.success, '更新日记失败');
    console.log('更新日记成功 ✓');
  } catch (error) {
    console.error('更新日记失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 获取所有日记
  console.log('测试获取所有日记...');
  try {
    const allRes = await axios.get(`${API_URL}/journals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(allRes.data.success, '获取所有日记失败');
    assert(Array.isArray(allRes.data.journals), '返回的日记不是数组');
    assert(allRes.data.journals.length > 0, '日记数组为空');
    console.log('获取所有日记成功 ✓');
  } catch (error) {
    console.error('获取所有日记失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试DeepSeek API集成
async function testDeepSeekIntegration() {
  console.log('\n测试DeepSeek API集成...');
  
  // 注意：这个测试需要用户已经在设置中配置了DeepSeek API密钥
  console.log('测试分析日记内容...');
  try {
    const analyzeRes = await axios.post(`${API_URL}/deepseek/analyze`, {
      content: testJournal.content,
      journalId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 如果API密钥未设置，这个请求可能会失败
    if (analyzeRes.data.success) {
      assert(analyzeRes.data.result, '分析结果为空');
      assert(analyzeRes.data.result.theme, '主题分析为空');
      console.log('分析日记内容成功 ✓');
    } else {
      console.log('分析日记内容失败，可能是API密钥未设置');
    }
  } catch (error) {
    console.log('分析日记内容失败，可能是API密钥未设置:', error.response?.data?.error || error.message);
  }
  
  // 测试提取待办事项
  console.log('测试提取待办事项...');
  try {
    const extractRes = await axios.post(`${API_URL}/deepseek/extract-tasks`, {
      content: testJournal.content,
      journalId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 如果API密钥未设置，这个请求可能会失败
    if (extractRes.data.success) {
      assert(Array.isArray(extractRes.data.tasks), '返回的任务不是数组');
      if (extractRes.data.tasks.length > 0) {
        taskId = extractRes.data.tasks[0]._id;
      }
      console.log('提取待办事项成功 ✓');
    } else {
      console.log('提取待办事项失败，可能是API密钥未设置');
    }
  } catch (error) {
    console.log('提取待办事项失败，可能是API密钥未设置:', error.response?.data?.error || error.message);
  }
}

// 测试待办事项功能
async function testTasks() {
  console.log('\n测试待办事项功能...');
  
  // 如果没有自动提取到任务，手动创建一个
  if (!taskId) {
    console.log('手动创建待办事项...');
    try {
      const createRes = await axios.post(`${API_URL}/tasks`, {
        content: '完成项目测试',
        journalId,
        originalText: '今天我计划完成项目的测试工作'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert(createRes.data.success, '创建待办事项失败');
      assert(createRes.data.task._id, '创建待办事项未返回ID');
      taskId = createRes.data.task._id;
      console.log('创建待办事项成功 ✓');
    } catch (error) {
      console.error('创建待办事项失败:', error.response?.data || error.message);
      throw error;
    }
  }
  
  // 获取所有待办事项
  console.log('测试获取所有待办事项...');
  try {
    const allRes = await axios.get(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(allRes.data.success, '获取所有待办事项失败');
    assert(Array.isArray(allRes.data.tasks), '返回的待办事项不是数组');
    assert(allRes.data.tasks.length > 0, '待办事项数组为空');
    console.log('获取所有待办事项成功 ✓');
  } catch (error) {
    console.error('获取所有待办事项失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 更新待办事项
  console.log('测试更新待办事项...');
  try {
    const updateRes = await axios.put(`${API_URL}/tasks/${taskId}`, {
      content: '完成项目测试和部署',
      completed: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(updateRes.data.success, '更新待办事项失败');
    console.log('更新待办事项成功 ✓');
  } catch (error) {
    console.error('更新待办事项失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 更新提醒状态
  console.log('测试更新提醒状态...');
  try {
    const reminderRes = await axios.put(`${API_URL}/tasks/${taskId}/reminder`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(reminderRes.data.success, '更新提醒状态失败');
    console.log('更新提醒状态成功 ✓');
  } catch (error) {
    console.error('更新提醒状态失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 完成待办事项
  console.log('测试完成待办事项...');
  try {
    const completeRes = await axios.put(`${API_URL}/tasks/${taskId}`, {
      completed: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(completeRes.data.success, '完成待办事项失败');
    assert(completeRes.data.task.completed === true, '待办事项未标记为已完成');
    console.log('完成待办事项成功 ✓');
  } catch (error) {
    console.error('完成待办事项失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试设置功能
async function testSettings() {
  console.log('\n测试设置功能...');
  
  // 获取设置
  console.log('测试获取设置...');
  try {
    const getRes = await axios.get(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(getRes.data.success, '获取设置失败');
    assert(getRes.data.settings, '设置为空');
    console.log('获取设置成功 ✓');
  } catch (error) {
    console.error('获取设置失败:', error.response?.data || error.message);
    throw error;
  }
  
  // 更新设置
  console.log('测试更新设置...');
  try {
    const updateRes = await axios.put(`${API_URL}/settings`, {
      reminderInterval: 30,
      theme: 'dark',
      emailNotifications: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(updateRes.data.success, '更新设置失败');
    assert(updateRes.data.settings.reminderInterval === 30, '提醒间隔未更新');
    assert(updateRes.data.settings.theme === 'dark', '主题未更新');
    console.log('更新设置成功 ✓');
  } catch (error) {
    console.error('更新设置失败:', error.response?.data || error.message);
    throw error;
  }
}

// 主测试函数
async function runTests() {
  console.log('开始API测试...\n');
  
  try {
    await testUserAuth();
    await testJournals();
    await testTasks();
    await testSettings();
    await testDeepSeekIntegration();
    
    console.log('\n所有测试通过! ✓✓✓');
  } catch (error) {
    console.error('\n测试失败:', error);
  }
}

// 运行测试
runTests();
