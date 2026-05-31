#!/bin/bash
set -e

echo "=================================="
echo "VibeCheck 阿里云一键部署脚本"
echo "=================================="
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误: 请使用root用户运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}[1/6] 更新系统软件包...${NC}"
apt-get update -y
apt-get upgrade -y

echo -e "${GREEN}[2/6] 安装必要依赖...${NC}"
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

echo -e "${GREEN}[3/6] 安装Docker...${NC}"
# 添加Docker官方GPG密钥
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置Docker仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
systemctl start docker
systemctl enable docker

echo -e "${GREEN}[4/6] 创建应用目录...${NC}"
mkdir -p /opt/vibecheck
cd /opt/vibecheck

echo -e "${GREEN}[5/6] 创建应用文件...${NC}"

# 创建package.json
cat > package.json <<'EOF'
{
  "name": "vibecheck",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.1",
    "@supabase/supabase-js": "^2.45.0",
    "https-proxy-agent": "^7.0.5",
    "next": "14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
EOF

# 创建.env.local
cat > .env.local <<'EOF'
# Anthropic API
ANTHROPIC_API_KEY=你的API密钥

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ifkqtidvevckjplylkmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma3F0aWR2ZXZja2pwbHlsa21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NjAzNjQsImV4cCI6MjA1MjIzNjM2NH0.r3dqPZpHRbhcGGEcLtqkgSiRr4P5AvCfKzqUUJRx6UE

# Environment
NODE_ENV=production
EOF

# 创建Dockerfile
cat > Dockerfile <<'EOF'
FROM node:18-alpine

WORKDIR /app

# 复制package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 构建Next.js应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
EOF

# 创建docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  vibecheck:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    restart: unless-stopped
    container_name: vibecheck-app
EOF

# 创建.dockerignore
cat > .dockerignore <<'EOF'
node_modules
.next
.git
.env.local
*.md
.vscode
EOF

echo -e "${YELLOW}[6/6] 需要配置环境变量...${NC}"
echo ""
echo "部署脚本已准备完成！"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "1. 需要下载完整的应用代码"
echo "2. 需要配置ANTHROPIC_API_KEY"
echo ""
echo "请按照接下来的指示操作。"
