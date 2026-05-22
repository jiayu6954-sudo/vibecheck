@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   VibeCheck Docker 启动脚本
echo ========================================
echo.

REM 检查 Docker 是否运行
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker Desktop 未运行或未安装
    echo.
    echo 请先安装并启动 Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM 检查 .env.local 是否存在
if not exist .env.local (
    echo [警告] .env.local 文件不存在
    echo.
    echo 正在从 .env.example 复制...
    copy .env.example .env.local >nul
    echo.
    echo [重要] 请编辑 .env.local 文件，填入真实的 API 密钥
    echo.
    notepad .env.local
    echo.
    echo 编辑完成后，按任意键继续...
    pause >nul
)

echo [1/3] 检查环境变量...
findstr "sk-ant-api03-your-api-key-here" .env.local >nul
if %errorlevel% equ 0 (
    echo [错误] 请先在 .env.local 中配置真实的 API 密钥！
    echo.
    notepad .env.local
    pause
    exit /b 1
)
echo ✓ 环境变量已配置

echo.
echo [2/3] 启动 Docker 容器...
docker-compose -f docker-compose-china.yml up -d

if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，查看日志:
    docker-compose -f docker-compose-china.yml logs
    pause
    exit /b 1
)

echo ✓ 容器启动成功

echo.
echo [3/3] 等待服务就绪...
timeout /t 5 /nobreak >nul
echo ✓ VibeCheck 已启动

echo.
echo ========================================
echo   VibeCheck 运行中
echo ========================================
echo.
echo   访问地址: http://localhost:3000
echo.
echo   停止服务: stop.bat
echo   查看日志: logs.bat
echo.
echo ========================================
echo.

REM 自动打开浏览器
start http://localhost:3000

pause
