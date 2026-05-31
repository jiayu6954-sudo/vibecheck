# 🚀 双API部署清单

快速部署指南：国内用DeepSeek，海外用Claude

---

## ✅ 准备工作（10分钟）

### **1. 注册DeepSeek（5分钟）**

```
□ 访问 https://platform.deepseek.com/
□ 注册账号（手机号/邮箱）
□ 创建API密钥
□ 复制密钥（sk-xxxxxx）
□ 充值 ¥20-50
```

**你的DeepSeek API Key：**
```
sk-_______________________________________
```

---

### **2. 本地测试（5分钟）**

```powershell
# 1. 更新代码
cd "E:\VibeCheck — AI 代码健康扫描器"
git status

# 2. 本地测试DeepSeek
# 编辑 .env.local
notepad .env.local

# 3. 添加以下配置：
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-你的密钥

# 4. 启动测试
npm run dev

# 5. 访问 http://localhost:3000 测试扫描
```

**✅ 本地测试成功？**
- [ ] 能扫描代码
- [ ] 返回结果正常
- [ ] 无错误日志

---

## 🌐 部署到阿里云（15分钟）

### **Step 1: 本地准备**

```powershell
# 1. 确认代码最新
cd "E:\VibeCheck — AI 代码健康扫描器"
git add .
git commit -m "Add DeepSeek dual API support"
git push

# 2. 准备部署
# 确保 deploy.ps1 已更新
```

---

### **Step 2: 执行部署**

```powershell
# 运行部署脚本
.\deploy.ps1

# 等待提示，输入密码约15次
# 密码：VibeCheck@2026
```

**部署过程：**
```
[1/10] SSH连接测试       - 10秒
[2/10] 准备文件          - 5秒
[3/10] 上传脚本          - 5秒
[4/10] 安装Node.js       - 略过（已安装）
[5/10] 创建目录          - 5秒
[6/10] 上传代码          - 30秒
[7/10] 创建环境变量      - 5秒
[8/10] 安装依赖          - 2分钟
[9/10] 构建生产版本      - 2分钟
[10/10] 启动服务         - 10秒

总耗时：约5分钟
```

---

### **Step 3: 配置DeepSeek API**

部署完成后，立即执行：

```powershell
# SSH连接
ssh root@120.26.204.81
# 密码：VibeCheck@2026
```

**在服务器上：**

```bash
# 1. 编辑环境变量
cd /var/www/vibecheck
nano .env.local

# 2. 找到这一行：
DEEPSEEK_API_KEY=PLACEHOLDER_REPLACE_AFTER_DEPLOY

# 3. 替换为你的密钥：
DEEPSEEK_API_KEY=sk-你的DeepSeek密钥

# 4. 保存：Ctrl+O → Enter → Ctrl+X

# 5. 重启服务
pm2 restart vibecheck

# 6. 检查日志
pm2 logs vibecheck --lines 20
```

**✅ 没有错误？继续！**

---

### **Step 4: 测试国内访问**

```
1. 关闭代理
2. 访问 http://120.26.204.81:3000
3. 登录账号
4. 粘贴测试代码
5. 点击 Scan Code
6. 检查结果
```

**✅ 测试成功标志：**
- [ ] 能打开网站
- [ ] 能登录
- [ ] 能扫描代码
- [ ] 返回扫描报告
- [ ] 无403错误
- [ ] 响应速度快（< 10秒）

---

## 🌍 Vercel保持不变（2分钟）

Vercel继续使用Claude API（无需改动）

### **确认Vercel配置：**

```
1. 访问 https://vercel.com/dashboard
2. 选择 vibecheck 项目
3. Settings → Environment Variables
4. 确认存在：
   ✅ ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ✅ AI_PROVIDER=claude (或留空，默认claude)
```

### **测试海外访问：**

```
1. 访问 https://vibecheck-pro.vercel.app
2. 登录账号
3. 测试扫描
4. 确认正常
```

---

## 📊 最终验证

### **国内用户测试：**

```
环境：关闭代理
URL：http://120.26.204.81:3000
使用：DeepSeek API

✅ 检查项：
□ 网站加载正常
□ 登录功能正常
□ 扫描功能正常
□ 邀请码兑换正常
□ 语言切换正常
□ 无API错误
```

---

### **海外用户测试：**

```
环境：任意网络
URL：https://vibecheck-pro.vercel.app
使用：Claude API

✅ 检查项：
□ 网站加载正常
□ 登录功能正常
□ 扫描功能正常
□ 邀请码兑换正常
□ 语言切换正常
□ 无API错误
```

---

## 🎉 部署完成！

### **当前配置：**

| 环境 | URL | AI提供商 | 状态 |
|------|-----|---------|------|
| **阿里云（国内）** | http://120.26.204.81:3000 | DeepSeek | ✅ |
| **Vercel（海外）** | https://vibecheck-pro.vercel.app | Claude | ✅ |
| **本地开发** | http://localhost:3000 | Claude+代理 | ✅ |

### **成本对比：**

```
假设1000次扫描/月：

纯Claude方案：
- 1000 × ¥0.26 = ¥260/月

双API方案（70%国内）：
- 700 × ¥0.005 = ¥3.5  (DeepSeek)
- 300 × ¥0.26 = ¥78    (Claude)
- 总计：¥81.5/月

节省：¥178.5/月（69%成本下降）
```

---

## 📞 需要帮助？

### **常见问题：**

**Q1: 扫描时出现403错误**
```bash
# 检查DeepSeek API Key
ssh root@120.26.204.81
cat /var/www/vibecheck/.env.local | grep DEEPSEEK

# 测试API
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-你的密钥" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'
```

**Q2: 部署后PM2不断重启**
```bash
# 查看错误日志
pm2 logs vibecheck --err --lines 50

# 常见原因：
# 1. API Key未配置
# 2. 构建失败
# 3. 环境变量错误
```

**Q3: 想切换回纯Claude**
```bash
# 编辑阿里云配置
ssh root@120.26.204.81
nano /var/www/vibecheck/.env.local

# 改为：
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# 重启
pm2 restart vibecheck
```

---

## 📝 下一步

- [ ] 监控DeepSeek使用量
- [ ] 定期检查余额
- [ ] 收集用户反馈
- [ ] 对比两个API的质量
- [ ] 准备推广素材

---

<p align="center">
  <b>🎉 恭喜！双API方案部署完成！</b>
  <br>
  <i>国内稳定 + 成本降低 + 用户体验提升</i>
</p>
