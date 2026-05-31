# DeepSeek API 配置指南

本指南帮助你在阿里云部署中集成DeepSeek API。

---

## 📋 为什么使用DeepSeek？

### **优势对比：**

| 项目 | Claude Sonnet 4.5 | DeepSeek V3 |
|------|------------------|-------------|
| **从中国访问** | ❌ 被墙，需代理 | ✅ 完全稳定 |
| **成本** | $3/$15 per 1M tokens | ¥0.5/¥2 per 1M tokens |
| **单次扫描** | ~¥0.26 | ~¥0.005 |
| **1000次扫描** | ¥260 | ¥5 |
| **质量** | ⭐⭐⭐⭐⭐ 顶级 | ⭐⭐⭐⭐ 优秀 |
| **代码理解** | 极强 | 很强 |
| **中文支持** | 好 | 更好 |

### **成本节省：**
```
DeepSeek 比 Claude 便宜 52倍！
月节省：~¥2,550（1000用户，10次/人）
年节省：~¥30,600
```

---

## 🚀 快速开始

### **Step 1: 注册DeepSeek账号（5分钟）**

1. **访问官网：**
   ```
   https://platform.deepseek.com/
   ```

2. **注册账号：**
   - 点击右上角「登录/注册」
   - 使用手机号或邮箱注册
   - 验证码登录

3. **实名认证（可选）：**
   - 提高免费额度
   - 支持更大并发

---

### **Step 2: 创建API密钥（2分钟）**

1. **进入API管理：**
   ```
   https://platform.deepseek.com/api_keys
   ```

2. **创建新密钥：**
   - 点击「创建API密钥」
   - 名称：VibeCheck Production
   - 点击「确定」

3. **复制密钥：**
   ```
   格式：sk-xxxxxxxxxxxxxxxxxxxxxxxx
   
   ⚠️ 重要：立即复制并保存！
   密钥只显示一次，关闭后无法再查看
   ```

---

### **Step 3: 充值（1分钟）**

1. **访问充值页面：**
   ```
   https://platform.deepseek.com/top_up
   ```

2. **充值金额：**
   ```
   建议：¥20 - ¥50
   
   使用预估：
   - ¥20 可扫描约 4,000 次
   - ¥50 可扫描约 10,000 次
   ```

3. **支付方式：**
   - 支持支付宝
   - 支持微信支付
   - 即时到账

---

### **Step 4: 配置服务器（5分钟）**

#### **SSH连接服务器：**

```bash
ssh root@120.26.204.81
# 密码：VibeCheck@2026
```

#### **编辑环境变量：**

```bash
cd /var/www/vibecheck
nano .env.local
```

#### **修改以下内容：**

```bash
# 找到这一行：
DEEPSEEK_API_KEY=PLACEHOLDER_REPLACE_AFTER_DEPLOY

# 改为：
DEEPSEEK_API_KEY=sk-你的DeepSeek密钥
```

**保存：** Ctrl+O → Enter → Ctrl+X

---

### **Step 5: 重启服务（1分钟）**

```bash
pm2 restart vibecheck

# 等待10秒
sleep 10

# 检查状态
pm2 status
pm2 logs vibecheck --lines 20
```

**成功标志：**
```
✅ PM2 status 显示 online
✅ 日志没有错误
✅ 没有 "403 forbidden" 错误
```

---

### **Step 6: 测试功能（2分钟）**

1. **关闭代理**

2. **访问网站：**
   ```
   http://120.26.204.81:3000
   ```

3. **粘贴测试代码：**
   ```javascript
   function getUser(id) {
     const query = "SELECT * FROM users WHERE id = " + id;
     return db.query(query);
   }
   ```

4. **点击 Scan Code**

5. **检查结果：**
   ```
   ✅ 能返回扫描报告
   ✅ 检测到 SQL 注入漏洞
   ✅ 响应速度快（< 5秒）
   ```

---

## 🔍 故障排查

### **问题1：API密钥无效**

**错误信息：**
```
DeepSeek API error: Invalid API key
```

**解决方案：**
```bash
# 1. 检查密钥格式
cat /var/www/vibecheck/.env.local | grep DEEPSEEK

# 2. 确认密钥正确
# 访问 https://platform.deepseek.com/api_keys 确认

# 3. 重新配置
nano /var/www/vibecheck/.env.local
# 修改DEEPSEEK_API_KEY
# 保存后重启：pm2 restart vibecheck
```

---

### **问题2：余额不足**

**错误信息：**
```
Insufficient balance
```

**解决方案：**
```
1. 访问 https://platform.deepseek.com/top_up
2. 充值 ¥20-50
3. 等待1分钟到账
4. 重试扫描
```

---

### **问题3：扫描失败**

**检查步骤：**

```bash
# 1. 查看日志
pm2 logs vibecheck --lines 50

# 2. 测试API连接
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(grep DEEPSEEK_API_KEY /var/www/vibecheck/.env.local | cut -d'=' -f2)" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'

# 3. 如果返回JSON，说明API Key有效
```

---

## 📊 使用监控

### **查看使用量：**

1. **访问控制台：**
   ```
   https://platform.deepseek.com/usage
   ```

2. **查看统计：**
   - 今日调用次数
   - 今日消费金额
   - 余额剩余

### **设置预警：**

```
建议设置：
- 余额低于 ¥10 时邮件提醒
- 每日消费超过 ¥5 时提醒
```

---

## 💡 最佳实践

### **成本控制：**

```
1. 定期检查余额（每周）
2. 监控异常调用
3. 设置每日上限
4. 定期清理僵尸用户
```

### **性能优化：**

```
1. 代码长度限制（500行）
2. 缓存扫描结果（相同代码）
3. 限制并发请求
```

---

## 🔄 切换回Claude

如果想切换回Claude API：

```bash
# 1. SSH到服务器
ssh root@120.26.204.81

# 2. 编辑配置
cd /var/www/vibecheck
nano .env.local

# 3. 修改
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# 4. 重启
pm2 restart vibecheck
```

---

## 📞 获取帮助

### **DeepSeek官方：**
- 文档：https://platform.deepseek.com/docs
- 社区：https://github.com/deepseek-ai
- 邮箱：support@deepseek.com

### **VibeCheck：**
- 查看日志：`pm2 logs vibecheck`
- 重启服务：`pm2 restart vibecheck`
- 查看状态：`pm2 status`

---

<p align="center">
  <i>DeepSeek API 配置完成！享受稳定、低成本的AI代码扫描服务 🚀</i>
</p>
