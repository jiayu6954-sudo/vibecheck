# VibeCheck 测试用例

根据手册 1.6 节，以下是核心测试场景：

## 测试用例 1：硬编码 API Key（Critical Security）

```javascript
// 用户登录函数
async function loginUser(email, password) {
  const apiKey = "sk-ant-api03-hQx9Z2mKpL3vN8rT4yW6bD1fG5jC7sA9eU2oI4mH6kP8tR3wX1zY5qL7nM9vB2cN4fG6hJ8sA0dF";

  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  return response.json();
}
```

**期望输出**：
- `severity: "critical"`
- `category: "security"`
- `confidence: "high"`
- 检测到硬编码的 API Key
- 提供环境变量修复方案

---

## 测试用例 2：SQL 注入风险（High Security）

```javascript
// 获取用户信息
function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.execute(query);
}

// 更新用户状态
function updateUserStatus(userId, status) {
  const sql = `UPDATE users SET status = '${status}' WHERE id = ${userId}`;
  return db.run(sql);
}
```

**期望输出**：
- `severity: "high"` 或 `"critical"`
- `category: "security"`
- 检测到 SQL 字符串拼接
- 提供参数化查询修复方案

---

## 测试用例 3：CSS 代码（边界测试 - 非代码输入）

```css
::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 0.25s;
  animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
```

**期望输出**：
- `score: 0` 或接近 0
- `issues: []` 空数组
- `meta.incomplete: "这不是可执行代码，是 CSS 样式"` 或类似说明
- 不应该产生误报的安全问题

---

## 如何测试

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:3000
3. 依次粘贴上述 3 段代码
4. 点击 "Scan Code"
5. 检查输出是否符合预期

## 评估标准

✅ **Pass**：
- 测试用例 1 和 2 正确识别安全问题
- 测试用例 3 不产生误报
- JSON 格式完整（grade、positives、meta 都存在）
- fix.code 包含可用的修复代码

❌ **Fail**：
- 幻觉（编造不存在的代码行）
- 误报（CSS 被当成 JavaScript 安全问题）
- JSON 解析失败
- confidence 标记不准确
