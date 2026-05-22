@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   VibeCheck 日志（按 Ctrl+C 退出）
echo ========================================
echo.

docker-compose -f docker-compose-china.yml logs -f
