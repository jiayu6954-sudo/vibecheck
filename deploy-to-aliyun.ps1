# VibeCheck 阿里云部署脚本 (PowerShell)
# 服务器: 120.26.204.81
# 用户: root
# 密码: VibeCheck@2026

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VibeCheck 阿里云一键部署" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "root@120.26.204.81"
$DEPLOY_DIR = "/var/www/vibecheck"

# 检查SSH连接
Write-Host "[1/10] 测试SSH连接..." -ForegroundColor Yellow
Write-Host "请输入密码: VibeCheck@2026" -ForegroundColor Green
ssh -o StrictHostKeyChecking=no $SERVER "echo '✅ SSH连接成功'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SSH连接失败" -ForegroundColor Red
    exit 1
}

# 创建临时打包目录
Write-Host ""
Write-Host "[2/10] 准备代码文件..." -ForegroundColor Yellow
$TempDir = New-Item -ItemType Directory -Path ".\temp_deploy" -Force

# 复制需要的文件
Copy-Item -Path "package.json" -Destination $TempDir
Copy-Item -Path "package-lock.json" -Destination $TempDir -ErrorAction SilentlyContinue
Copy-Item -Path "next.config.js" -Destination $TempDir -ErrorAction SilentlyContinue
Copy-Item -Path "vercel.json" -Destination $TempDir -ErrorAction SilentlyContinue
Copy-Item -Path "pages" -Destination $TempDir -Recurse -Force
Copy-Item -Path "public" -Destination $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "styles" -Destination $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ 代码文件准备完成" -ForegroundColor Green

# 上传部署脚本
Write-Host ""
Write-Host "[3/10] 上传服务器初始化脚本..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no "deploy-aliyun-auto.sh" "root@120.26.204.81:/root/"

# 执行服务器初始化
Write-Host ""
Write-Host "[4/10] 安装服务器环境 (Node.js + PM2)..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟，请耐心等待..." -ForegroundColor Gray
ssh $SERVER 'chmod +x /root/deploy-aliyun-auto.sh'
ssh $SERVER 'bash /root/deploy-aliyun-auto.sh'

# 创建应用目录
Write-Host ""
Write-Host "[5/10] 创建应用目录..." -ForegroundColor Yellow
ssh $SERVER 'mkdir -p /var/www/vibecheck'

# 上传代码文件
Write-Host ""
Write-Host "[6/10] 上传代码到服务器..." -ForegroundColor Yellow
scp -r "$TempDir\*" "root@120.26.204.81:/var/www/vibecheck/"

# 清理临时目录
Remove-Item -Path $TempDir -Recurse -Force

# 创建环境变量
Write-Host ""
Write-Host "[7/10] 配置环境变量..." -ForegroundColor Yellow
$envContent = @"
ANTHROPIC_API_KEY=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
NEXT_PUBLIC_SUPABASE_URL=https://xaskqsjgdsfzqayxjwjd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc2txc2pnZHNmenFheXhqd2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTYzNDUsImV4cCI6MjA5NDU5MjM0NX0.X5n4ApxWAvnuSwF0yPAjggjXZyKoMcJQKK8CO0O592E
NODE_ENV=production
PORT=3000
"@
echo $envContent | ssh $SERVER 'cat > /var/www/vibecheck/.env.local'

# 安装依赖
Write-Host ""
Write-Host "[8/10] 安装依赖包..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟..." -ForegroundColor Gray
ssh $SERVER 'cd /var/www/vibecheck && npm install --production'

# 构建生产版本
Write-Host ""
Write-Host "[9/10] 构建生产版本..." -ForegroundColor Yellow
ssh $SERVER 'cd /var/www/vibecheck && npm run build'

# 启动服务
Write-Host ""
Write-Host "[10/10] 启动服务..." -ForegroundColor Yellow
ssh $SERVER 'pm2 delete vibecheck 2>/dev/null || true'
ssh $SERVER 'cd /var/www/vibecheck && pm2 start npm --name vibecheck -- start'
ssh $SERVER 'pm2 save'
ssh $SERVER 'pm2 startup'

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ 部署成功！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 访问地址: " -NoNewline
Write-Host "http://120.26.204.81:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 管理命令 (SSH到服务器后执行):" -ForegroundColor Yellow
Write-Host "  查看日志: pm2 logs vibecheck"
Write-Host "  重启服务: pm2 restart vibecheck"
Write-Host "  停止服务: pm2 stop vibecheck"
Write-Host "  查看状态: pm2 status"
Write-Host ""
Write-Host "💡 测试建议:" -ForegroundColor Yellow
Write-Host "  1. 关闭代理"
Write-Host "  2. 访问 http://120.26.204.81:3000"
Write-Host "  3. 测试扫描功能"
Write-Host "  4. 测试邀请码功能"
Write-Host ""
