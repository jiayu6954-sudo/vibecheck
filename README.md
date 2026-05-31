# VibeCheck - AI 代码安全扫描器

🛡️ 专为AI生成代码设计的安全与质量扫描工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204.5-orange.svg)](https://anthropic.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)

---

## ✨ 核心功能

- 🔒 **安全漏洞检测** - 识别SQL注入、XSS、命令注入等OWASP Top 10漏洞
- 🔧 **代码质量分析** - 检测可维护性问题、代码异味
- ⚡ **性能优化建议** - 发现性能瓶颈和资源浪费
- 🌍 **双语支持** - 中文/英文扫描报告，一键切换
- 💡 **可执行建议** - 提供详细的修复方案和代码示例
- 🎯 **AI深度分析** - 基于Claude Sonnet 4.5的智能代码理解

---

## 🚀 在线使用

### **国内用户**
```
http://120.26.204.81:3000
```
- ✅ 无需代理，直接访问
- ✅ 国内服务器，速度快

### **海外用户**
```
https://vibecheck-pro.vercel.app
```
- ✅ 全球CDN加速
- ✅ HTTPS安全连接

---

## 💎 使用套餐

| 套餐 | 每日扫描次数 | 价格 | 获取方式 |
|------|-------------|------|---------|
| **Free** | 3次/天 | 免费 | 邮箱注册即可 |
| **Pro** | 无限 | ¥29/月 | 使用邀请码升级 |
| **VIP** | 无限 | - | 创始会员专属 |

---

## 📖 快速开始

### **1. 访问网站**
打开 http://120.26.204.81:3000 或 https://vibecheck-pro.vercel.app

### **2. 登录**
输入邮箱 → 收取Magic Link邮件 → 点击登录链接

### **3. 开始扫描**
- 粘贴AI生成的代码
- 选择输出语言（🇨🇳 中文 / 🇬🇧 English）
- 点击"Scan Code"
- 查看安全分析报告

### **4. 升级Pro（可选）**
- 使用邀请码解锁无限扫描
- 点击顶部"Redeem Invite Code"
- 输入邀请码（如：`EARLY2026`）

---

## 🛠️ 本地开发

### **环境要求**
- Node.js 18+
- npm 或 yarn

### **安装步骤**

1. **克隆仓库**
```bash
git clone <your-repo-url>
cd vibecheck
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

填写以下配置：

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 环境
NODE_ENV=development
```

获取API密钥：
- Anthropic: https://console.anthropic.com/
- Supabase: https://supabase.com/dashboard

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

---

## 📦 部署

### **Vercel部署（推荐海外）**
```bash
vercel --prod
```

### **阿里云部署（推荐国内）**
```bash
# 使用自动部署脚本
.\deploy.ps1
```

详见：[DEPLOYMENT.md](DEPLOYMENT.md)

### **Docker部署（本地分发）**
```bash
docker-compose up -d
```

详见：[README-DOCKER.md](README-DOCKER.md)

---

## 📂 项目结构

```
vibecheck/
├── pages/
│   ├── index.js              # 主界面（扫描、登录、邀请码）
│   ├── api/
│   │   ├── scan.js           # 扫描API（Claude集成）
│   │   └── redeem-code.js    # 邀请码兑换API
│   └── _app.js
├── lib/
│   └── supabase.js           # Supabase客户端配置
├── styles/
│   └── globals.css           # 全局样式 + Tailwind
├── public/                   # 静态资源
├── deploy.ps1                # 阿里云部署脚本
├── docker-compose.yml        # Docker配置
└── README-DOCKER.md          # Docker部署指南
```

---

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 14** | React框架（Pages Router）|
| **Tailwind CSS** | 样式框架 |
| **Claude Sonnet 4.5** | AI代码分析引擎 |
| **Supabase** | 认证 + 数据库 |
| **Vercel** | 海外部署 |
| **阿里云ECS** | 国内部署 |

---

## 📚 文档

- [用户使用指南](USER_GUIDE.md) - 如何使用VibeCheck
- [部署指南](DEPLOYMENT.md) - Vercel/阿里云/Docker部署
- [邀请码管理](INVITE_CODES.md) - 邀请码系统说明
- [Docker部署](README-DOCKER.md) - 本地Docker部署

---

## 🎯 路线图

### **✅ 已完成**
- [x] 核心扫描功能
- [x] 双语输出支持
- [x] Supabase认证
- [x] 邀请码系统
- [x] 国内外双部署
- [x] Docker打包

### **🚧 进行中**
- [ ] Pro用户100次/月配额
- [ ] 用户数据统计看板
- [ ] API成本监控

### **📋 计划中**
- [ ] 支付系统集成（微信/支付宝/Stripe）
- [ ] 自动发码系统
- [ ] 用户管理后台
- [ ] 邮件通知（额度提醒）
- [ ] Semgrep规则集成

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📧 联系方式

- GitHub: [你的GitHub]
- Email: [你的邮箱]
- Twitter: [你的Twitter]

---

<p align="center">
  Made with ❤️ by VibeCheck Team
  <br>
  Powered by <a href="https://anthropic.com">Claude AI</a>
</p>
