#!/bin/bash
set -e

echo "=================================="
echo "VibeCheck 完整部署脚本"
echo "=================================="
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}步骤 1/7: 更新系统${NC}"
apt-get update -y
apt-get upgrade -y

echo -e "${BLUE}步骤 2/7: 安装依赖${NC}"
apt-get install -y ca-certificates curl gnupg lsb-release git

echo -e "${BLUE}步骤 3/7: 安装Docker${NC}"
if ! command -v docker &> /dev/null; then
    # 添加Docker GPG密钥
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # 添加Docker仓库
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # 启动Docker
    systemctl start docker
    systemctl enable docker

    echo -e "${GREEN}✓ Docker安装完成${NC}"
else
    echo -e "${GREEN}✓ Docker已安装${NC}"
fi

echo -e "${BLUE}步骤 4/7: 克隆代码${NC}"
cd /opt
if [ -d "vibecheck" ]; then
    echo -e "${YELLOW}目录已存在，删除旧版本...${NC}"
    rm -rf vibecheck
fi

git clone https://github.com/jiayu6954-sudo/vibecheck.git
cd vibecheck

echo -e "${BLUE}步骤 5/7: 配置环境变量${NC}"
echo -e "${YELLOW}请输入你的Anthropic API Key:${NC}"
read -r ANTHROPIC_KEY

cat > .env.local <<EOF
# Anthropic API
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ifkqtidvevckjplylkmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma3F0aWR2ZXZja2pwbHlsa21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NjAzNjQsImV4cCI6MjA1MjIzNjM2NH0.r3dqPZpHRbhcGGEcLtqkgSiRr4P5AvCfKzqUUJRx6UE

# Environment
NODE_ENV=production
EOF

echo -e "${GREEN}✓ 环境配置完成${NC}"

echo -e "${BLUE}步骤 6/7: 构建Docker镜像${NC}"
docker build -t vibecheck:latest .

echo -e "${BLUE}步骤 7/7: 启动服务${NC}"
# 停止旧容器
docker stop vibecheck-app 2>/dev/null || true
docker rm vibecheck-app 2>/dev/null || true

# 启动新容器
docker run -d \
  --name vibecheck-app \
  -p 3000:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  vibecheck:latest

echo ""
echo -e "${GREEN}=================================="
echo "🎉 部署成功！"
echo "==================================${NC}"
echo ""
echo -e "${YELLOW}访问地址：${NC}"
echo -e "${BLUE}http://120.26.204.81:3000${NC}"
echo ""
echo -e "${YELLOW}常用命令：${NC}"
echo "查看日志: docker logs -f vibecheck-app"
echo "重启服务: docker restart vibecheck-app"
echo "停止服务: docker stop vibecheck-app"
echo "启动服务: docker start vibecheck-app"
echo ""
