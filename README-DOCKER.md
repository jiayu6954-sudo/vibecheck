# VibeCheck Docker 部署指南（中国大陆版）

🛡️ **VibeCheck** - AI 代码安全扫描器

适合分发给朋友在本地运行，支持中国大陆环境。

---

## 📋 系统要求

- **操作系统**: Windows 10/11、macOS、Linux
- **Docker Desktop**: 必须安装
- **内存**: 至少 4GB
- **磁盘**: 至少 2GB 可用空间

---

## 🚀 快速开始（3 步）

### **步骤 1：安装 Docker Desktop**

#### Windows / macOS:
下载并安装：https://www.docker.com/products/docker-desktop/

#### 中国大陆用户加速：
安装后配置 Docker 镜像加速：
1. 打开 Docker Desktop
2. 设置 → Docker Engine
3. 添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://registry.docker-cn.com"
  ]
}
```

4. 点击 "Apply & Restart"

---

### **步骤 2：配置环境变量**

1. **复制 `.env.example` 为 `.env.local`**
   ```bash
   copy .env.example .env.local
   ```

2. **编辑 `.env.local`，填入真实值：**

   ```bash
   # Claude API Key（必需）
   ANTHROPIC_API_KEY=sk-ant-api03-你的密钥

   # Supabase 配置（必需）
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
   ```

   **获取这些密钥：**
   - **Claude API**: https://console.anthropic.com/
   - **Supabase**: 联系 VibeCheck 管理员获取

---

### **步骤 3：启动 VibeCheck**

在项目目录（包含 `docker-compose-china.yml` 的文件夹）执行：

#### Windows (命令提示符):
```bash
docker-compose -f docker-compose-china.yml up -d
```

#### macOS / Linux:
```bash
docker-compose -f docker-compose-china.yml up -d
```

**首次启动需要 3-5 分钟**（下载镜像 + 构建）

---

## ✅ 验证是否成功

打开浏览器访问：**http://localhost:3000**

应该看到 VibeCheck 登录页面！

---

## 🛠️ 常用命令

### **查看运行状态**
```bash
docker-compose -f docker-compose-china.yml ps
```

### **查看日志**
```bash
docker-compose -f docker-compose-china.yml logs -f
```

### **停止服务**
```bash
docker-compose -f docker-compose-china.yml down
```

### **重启服务**
```bash
docker-compose -f docker-compose-china.yml restart
```

### **完全重新构建**
```bash
docker-compose -f docker-compose-china.yml down
docker-compose -f docker-compose-china.yml build --no-cache
docker-compose -f docker-compose-china.yml up -d
```

---

## 🔧 故障排查

### **问题 1：无法访问 localhost:3000**

**检查容器状态：**
```bash
docker ps
```

应该看到 `vibecheck-app` 正在运行。

**查看日志：**
```bash
docker logs vibecheck-app
```

---

### **问题 2：扫描失败（403/500 错误）**

**原因：** 环境变量配置错误

**解决：**
1. 检查 `.env.local` 文件是否存在
2. 确认 API 密钥正确无误
3. 重启容器：
   ```bash
   docker-compose -f docker-compose-china.yml restart
   ```

---

### **问题 3：Docker 下载速度慢**

**解决：** 使用国内镜像源

在 `docker-compose-china.yml` 中取消注释：
```yaml
image: registry.cn-hangzhou.aliyuncs.com/vibecheck/app:latest
```

---

### **问题 4：Claude API 在大陆无法访问**

**原因：** `api.anthropic.com` 被墙

**解决方案 A：** 使用代理
```bash
# 在 .env.local 添加
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

**解决方案 B：** 使用国内 AI 服务（需要修改代码）
- 阿里通义千问
- 百度文心一言
- 月之暗面 Kimi

---

## 📊 系统架构

```
用户浏览器 (localhost:3000)
    ↓
Docker 容器 (Next.js 应用)
    ↓
外部服务:
  - Anthropic API (Claude AI)
  - Supabase (数据库 + 认证)
```

**注意：** 数据库和 AI 服务仍然使用在线服务，不在 Docker 中。

---

## 🎁 邀请码

联系管理员获取邀请码，激活 Pro 无限扫描：

- `EARLY2026` - 早期用户
- `VIBECHECK2026` - 发布促销
- 或请求专属邀请码

---

## 📞 技术支持

- **GitHub Issues**: https://github.com/jiayu6954-sudo/vibecheck/issues
- **Email**: jiayu6954@gmail.com

---

## 📄 许可证

MIT License - 可自由使用、修改、分发

---

🛡️ **VibeCheck v1.0** - Built with ❤️ using Next.js + Claude Sonnet 4
