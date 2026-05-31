#!/bin/bash
# VibeCheck 阿里云自动部署脚本
# 服务器IP: 120.26.204.81

set -e

echo "=========================================="
echo "VibeCheck 阿里云部署脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 更新系统
echo -e "${YELLOW}[1/8] 更新系统...${NC}"
apt-get update

# 安装Node.js 18
echo -e "${YELLOW}[2/8] 安装Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)"

# 安装Git
echo -e "${YELLOW}[3/8] 安装Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
fi

# 安装PM2
echo -e "${YELLOW}[4/8] 安装PM2进程管理器...${NC}"
npm install -g pm2

# 创建应用目录
echo -e "${YELLOW}[5/8] 创建应用目录...${NC}"
mkdir -p /var/www/vibecheck
cd /var/www/vibecheck

# 下载代码（如果是首次部署）
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[6/8] 等待代码上传...${NC}"
    echo "代码将通过SCP上传"
else
    echo -e "${YELLOW}[6/8] 代码目录已存在，跳过${NC}"
fi

# 安装依赖（等待代码上传后）
echo -e "${YELLOW}[7/8] 准备安装依赖...${NC}"
# npm install 将在代码上传后执行

echo -e "${YELLOW}[8/8] 服务器准备完成！${NC}"
echo ""
echo -e "${GREEN}=========================================="
echo "✅ 服务器基础环境安装完成"
echo "=========================================="
echo -e "${NC}"
echo "下一步："
echo "1. 上传代码到 /var/www/vibecheck"
echo "2. 运行 npm install"
echo "3. 创建 .env.local"
echo "4. 运行 npm run build"
echo "5. 使用PM2启动服务"
echo ""
