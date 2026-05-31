# VibeCheck 部署指南

本指南涵盖三种部署方式：Vercel、阿里云ECS、Docker本地部署。

---

## 📋 目录

- [Vercel部署（海外推荐）](#vercel部署)
- [阿里云ECS部署（国内推荐）](#阿里云ecs部署)
- [Docker本地部署](#docker本地部署)
- [环境变量配置](#环境变量配置)
- [数据库配置](#数据库配置)

---

## 🌍 Vercel部署

**适合场景：** 海外用户访问，全球CDN加速

### **前置要求**

- GitHub账号
- Vercel账号（https://vercel.com）
- Supabase账号（https://supabase.com）
- Anthropic API密钥（https://console.anthropic.com）

### **部署步骤**

#### **1. 准备代码**

```bash
# 克隆或上传代码到GitHub
git clone <your-repo>
cd vibecheck
git remote add origin <your-github-repo>
git push -u origin main
```

#### **2. 连接Vercel**

1. 访问 https://vercel.com/dashboard
2. 点击 "Add New Project"
3. 导入你的GitHub仓库
4. 选择 "VibeCheck" 项目

#### **3. 配置环境变量**

在Vercel项目设置中添加：

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

#### **4. 部署**

```bash
# 方式1: 通过Vercel Dashboard
点击 "Deploy" 按钮

# 方式2: 使用Vercel CLI
npm install -g vercel
vercel --prod
```

#### **5. 配置自定义域名（可选）**

1. Vercel Dashboard → Settings → Domains
2. 添加你的域名（如 vibecheck.com）
3. 配置DNS记录（CNAME或A记录）

#### **6. 配置Supabase重定向**

访问 Supabase Dashboard → Authentication → URL Configuration

添加：
```
Site URL: https://your-domain.vercel.app
Redirect URLs: https://your-domain.vercel.app/**
```

### **更新部署**

```bash
# 推送代码到GitHub会自动触发部署
git add .
git commit -m "Update"
git push

# 或使用Vercel CLI
vercel --prod
```

---

## 🇨🇳 阿里云ECS部署

**适合场景：** 国内用户访问，无需代理

### **前置要求**

- 阿里云账号
- ECS服务器（2核2G最低配置）
- Ubuntu 22.04 系统
- 已配置SSH密钥或密码

### **快速部署（使用脚本）**

#### **1. 准备本地环境**

Windows PowerShell（管理员模式）

#### **2. 配置服务器信息**

编辑 `deploy.ps1`（已配置好，无需修改）

#### **3. 执行一键部署**

```powershell
cd "E:\VibeCheck — AI 代码健康扫描器"
.\deploy.ps1
```

**输入密码时注意：**
- 密码不会显示（正常现象）
- 需要输入15-18次
- 每次都输入相同的root密码

**部署时长：** 约10-15分钟

**成功标志：**
```
==========================================
Deployment Complete!
==========================================
URL: http://120.26.204.81:3000
```

#### **4. 配置安全组**

阿里云控制台 → ECS → 安全组 → 配置规则

添加入站规则：
```
SSH (22/22)     - 0.0.0.0/0
自定义TCP (3000/3000) - 0.0.0.0/0
```

#### **5. 配置Supabase**

Supabase Dashboard → Authentication → URL Configuration

添加：
```
Site URL: http://120.26.204.81:3000
Redirect URLs: http://120.26.204.81:3000/**
```

---

### **手动部署（详细步骤）**

如果脚本失败，可以手动部署：

#### **1. SSH连接服务器**

```bash
ssh root@120.26.204.81
# 输入密码
```

#### **2. 安装Node.js 18**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs
node --version  # 确认安装
```

#### **3. 安装PM2**

```bash
sudo npm install -g pm2
```

#### **4. 创建应用目录**

```bash
mkdir -p /var/www/vibecheck
cd /var/www/vibecheck
```

#### **5. 上传代码**

**方式A: 使用SCP（从本地）**

```powershell
# 在本地PowerShell执行
scp -r pages lib public styles package.json .env.local root@120.26.204.81:/var/www/vibecheck/
```

**方式B: 使用Git**

```bash
# 在服务器上执行
git clone <your-repo> .
```

#### **6. 安装依赖**

```bash
cd /var/www/vibecheck
npm install --production
```

#### **7. 构建生产版本**

```bash
npm run build
```

#### **8. 启动服务**

```bash
pm2 start npm --name vibecheck -- start
pm2 save
pm2 startup  # 设置开机自启
```

#### **9. 检查状态**

```bash
pm2 status
# 应该显示 "online"

pm2 logs vibecheck
# 查看日志
```

---

### **服务管理命令**

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs vibecheck

# 重启服务
pm2 restart vibecheck

# 停止服务
pm2 stop vibecheck

# 删除服务
pm2 delete vibecheck

# 查看详细信息
pm2 show vibecheck
```

---

### **更新部署**

```bash
# SSH到服务器
ssh root@120.26.204.81

# 进入目录
cd /var/www/vibecheck

# 拉取最新代码
git pull

# 重新安装依赖（如果package.json有变化）
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart vibecheck
```

---

## 🐳 Docker本地部署

**适合场景：** 分发给朋友，本地运行

详细文档请参考：[README-DOCKER.md](README-DOCKER.md)

### **快速开始**

```bash
# 1. 确保安装了Docker Desktop

# 2. 克隆项目
git clone <your-repo>
cd vibecheck

# 3. 创建.env.local
cp .env.local.example .env.local
# 编辑填入API密钥

# 4. 启动服务
docker-compose up -d

# 5. 访问
http://localhost:3000
```

### **Windows一键启动**

```batch
# 双击执行
start.bat
```

### **停止服务**

```batch
stop.bat
```

---

## 🔧 环境变量配置

### **必需变量**

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `ANTHROPIC_API_KEY` | Claude API密钥 | https://console.anthropic.com/ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase项目URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | Supabase Dashboard → Settings → API |

### **可选变量**

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 端口号 | `3000` |

### **`.env.local` 示例**

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=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

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xaskqsjgdsfzqayxjwjd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc2txc2pnZHNmenFheXhqd2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTYzNDUsImV4cCI6MjA5NDU5MjM0NX0.X5n4ApxWAvnuSwF0yPAjggjXZyKoMcJQKK8CO0O592E

# Environment
NODE_ENV=production
PORT=3000
```

---

## 🗄️ 数据库配置

### **Supabase表结构**

需要创建以下表：

#### **1. profiles（用户信息）**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. user_usage（使用记录）**

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE,
  scan_count INT DEFAULT 0,
  UNIQUE(user_id, date)
);
```

#### **3. invite_codes（邀请码）**

```sql
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. invite_code_usage（邀请码使用记录）**

```sql
CREATE TABLE invite_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT REFERENCES invite_codes(code),
  user_id UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code, user_id)
);
```

### **RLS策略**

```sql
-- profiles表
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- invite_codes表
CREATE POLICY "Allow authenticated to read invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (true);
```

### **SQL函数**

```sql
-- 自增扫描次数
CREATE OR REPLACE FUNCTION increment_scan_count(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_usage (user_id, date, scan_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET scan_count = user_usage.scan_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 兑换邀请码
CREATE OR REPLACE FUNCTION redeem_invite_code(p_user_id UUID, p_code TEXT)
RETURNS JSON AS $$
-- 见 fix-redeem-function.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

完整SQL脚本见：
- `supabase-schema.sql` - 表结构
- `supabase-invite-codes.sql` - 邀请码数据
- `fix-redeem-function.sql` - 兑换函数

---

## 🔍 故障排查

### **Vercel部署失败**

**问题：** Build failed

**解决：**
```bash
# 本地测试构建
npm run build

# 检查错误日志
vercel logs <deployment-url>
```

---

### **阿里云服务无法访问**

**问题：** http://120.26.204.81:3000 无法打开

**检查清单：**
1. ✅ ECS实例状态是"运行中"
2. ✅ 安全组3000端口已开放
3. ✅ PM2服务状态是"online"

```bash
# SSH到服务器检查
pm2 status
netstat -tulpn | grep 3000
```

---

### **PM2服务不断重启**

**问题：** 重启次数一直增加

```bash
# 查看日志
pm2 logs vibecheck --lines 50

# 常见原因：
# 1. .next目录构建失败 → 重新npm run build
# 2. 环境变量缺失 → 检查.env.local
# 3. 端口被占用 → lsof -i :3000
```

---

### **登录邮件无法跳转**

**问题：** 点击邮件登录链接后无法回到网站

**解决：** 配置Supabase重定向URL

```
Supabase → Authentication → URL Configuration
添加你的部署域名到 Redirect URLs
```

---

## 📊 监控与维护

### **日志查看**

**Vercel:**
```bash
vercel logs <deployment-url> --follow
```

**阿里云:**
```bash
pm2 logs vibecheck --lines 100
```

### **性能监控**

**PM2监控：**
```bash
pm2 monit
```

**Supabase监控：**
- Dashboard → Reports
- 查看API请求量、数据库连接等

### **备份**

**数据库备份：**
```bash
# Supabase自动每日备份
# 手动导出：Dashboard → Database → Backups
```

**代码备份：**
```bash
git push origin main
```

---

## 📞 获取帮助

部署遇到问题？

- 📖 查看 [README.md](README.md)
- 🐛 提交Issue到GitHub
- 💬 加入Discord社区
- 📧 Email: support@vibecheck.com

---

<p align="center">
  <i>祝部署顺利！🚀</i>
  <br><br>
  VibeCheck Team
</p>
