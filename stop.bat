@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   停止 VibeCheck
echo ========================================
echo.

docker-compose -f docker-compose-china.yml down

echo.
echo ✓ VibeCheck 已停止
echo.
pause
