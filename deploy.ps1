# VibeCheck Aliyun Deployment Script
# Server: 120.26.204.81 | User: root | Password: VibeCheck@2026

$ErrorActionPreference = "Stop"
$SERVER = "root@120.26.204.81"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VibeCheck Deployment to Aliyun" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Test SSH
Write-Host "[1/10] Testing SSH connection..." -ForegroundColor Yellow
Write-Host "Password: VibeCheck@2026" -ForegroundColor Green
ssh -o StrictHostKeyChecking=no $SERVER 'echo "SSH OK"'
if ($LASTEXITCODE -ne 0) { Write-Host "SSH failed" -ForegroundColor Red; exit 1 }

# Step 2: Prepare files
Write-Host "[2/10] Preparing files..." -ForegroundColor Yellow
$TempDir = New-Item -ItemType Directory -Path ".\temp_deploy" -Force
Copy-Item -Path "package.json" -Destination $TempDir
Copy-Item -Path "package-lock.json" -Destination $TempDir -ErrorAction SilentlyContinue
Copy-Item -Path "next.config.js" -Destination $TempDir -ErrorAction SilentlyContinue
Copy-Item -Path "pages" -Destination $TempDir -Recurse -Force
Copy-Item -Path "lib" -Destination $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public" -Destination $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "styles" -Destination $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Files ready" -ForegroundColor Green

# Step 3: Upload init script
Write-Host "[3/10] Uploading init script..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no "deploy-aliyun-auto.sh" "root@120.26.204.81:/root/"

# Step 4: Install Node.js + PM2
Write-Host "[4/10] Installing Node.js + PM2..." -ForegroundColor Yellow
Write-Host "This may take 3-5 minutes..." -ForegroundColor Gray
ssh $SERVER 'chmod +x /root/deploy-aliyun-auto.sh'
ssh $SERVER 'bash /root/deploy-aliyun-auto.sh'

# Step 5: Create app directory
Write-Host "[5/10] Creating app directory..." -ForegroundColor Yellow
ssh $SERVER 'mkdir -p /var/www/vibecheck'

# Step 6: Upload code
Write-Host "[6/10] Uploading code..." -ForegroundColor Yellow
scp -r "$TempDir\*" "root@120.26.204.81:/var/www/vibecheck/"
Remove-Item -Path $TempDir -Recurse -Force

# Step 7: Create .env.local (DeepSeek for China)
Write-Host "[7/10] Creating .env.local with DeepSeek API..." -ForegroundColor Yellow
$envContent = @"
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=PLACEHOLDER_REPLACE_AFTER_DEPLOY
NEXT_PUBLIC_SUPABASE_URL=https://xaskqsjgdsfzqayxjwjd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc2txc2pnZHNmenFheXhqd2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTYzNDUsImV4cCI6MjA5NDU5MjM0NX0.X5n4ApxWAvnuSwF0yPAjggjXZyKoMcJQKK8CO0O592E
NODE_ENV=production
PORT=3000
"@
Write-Output $envContent | ssh $SERVER 'cat > /var/www/vibecheck/.env.local'
Write-Host ""
Write-Host "IMPORTANT: You need to add DeepSeek API key after deployment!" -ForegroundColor Yellow
Write-Host "Visit: https://platform.deepseek.com/ to get your API key" -ForegroundColor Cyan

# Step 8: Install dependencies
Write-Host "[8/10] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Gray
ssh $SERVER 'cd /var/www/vibecheck && npm install --production'

# Step 9: Build production
Write-Host "[9/10] Building production..." -ForegroundColor Yellow
ssh $SERVER 'cd /var/www/vibecheck && npm run build'

# Step 10: Start service
Write-Host "[10/10] Starting service..." -ForegroundColor Yellow
ssh $SERVER 'pm2 delete vibecheck 2>/dev/null || true'
ssh $SERVER 'cd /var/www/vibecheck && pm2 start npm --name vibecheck -- start'
ssh $SERVER 'pm2 save'
ssh $SERVER 'pm2 startup'

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: " -NoNewline
Write-Host "http://120.26.204.81:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Management commands:" -ForegroundColor Yellow
Write-Host "  pm2 logs vibecheck"
Write-Host "  pm2 restart vibecheck"
Write-Host "  pm2 stop vibecheck"
Write-Host "  pm2 status"
Write-Host ""
