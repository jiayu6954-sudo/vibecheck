@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   VibeCheck 打包脚本（分发给朋友）
echo ========================================
echo.

REM 检查是否安装了 7-Zip 或 WinRAR
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    set ZIPPER=7z
    goto :pack
)

where winrar >nul 2>&1
if %errorlevel% equ 0 (
    set ZIPPER=winrar
    goto :pack
)

echo [错误] 未找到 7-Zip 或 WinRAR
echo.
echo 请安装其中之一:
echo - 7-Zip: https://www.7-zip.org/
echo - WinRAR: https://www.winrar.com.cn/
echo.
pause
exit /b 1

:pack
echo [1/4] 清理临时文件...
if exist VibeCheck-Docker-Release rmdir /s /q VibeCheck-Docker-Release
mkdir VibeCheck-Docker-Release

echo [2/4] 复制必要文件...
xcopy /E /I /Y pages VibeCheck-Docker-Release\pages >nul
xcopy /E /I /Y lib VibeCheck-Docker-Release\lib >nul
xcopy /E /I /Y styles VibeCheck-Docker-Release\styles >nul
copy package.json VibeCheck-Docker-Release\ >nul
copy package-lock.json VibeCheck-Docker-Release\ >nul
copy next.config.mjs VibeCheck-Docker-Release\ >nul
copy jsconfig.json VibeCheck-Docker-Release\ >nul
copy tailwind.config.js VibeCheck-Docker-Release\ >nul
copy postcss.config.js VibeCheck-Docker-Release\ >nul
copy Dockerfile VibeCheck-Docker-Release\ >nul
copy docker-compose-china.yml VibeCheck-Docker-Release\ >nul
copy .dockerignore VibeCheck-Docker-Release\ >nul
copy .env.example VibeCheck-Docker-Release\ >nul
copy start.bat VibeCheck-Docker-Release\ >nul
copy stop.bat VibeCheck-Docker-Release\ >nul
copy logs.bat VibeCheck-Docker-Release\ >nul
copy README-DOCKER.md VibeCheck-Docker-Release\README.md >nul
copy LICENSE VibeCheck-Docker-Release\ >nul

echo [3/4] 压缩打包...
if "%ZIPPER%"=="7z" (
    7z a -tzip VibeCheck-Docker-v1.0.zip VibeCheck-Docker-Release\* >nul
) else (
    winrar a -afzip VibeCheck-Docker-v1.0.zip VibeCheck-Docker-Release\* >nul
)

echo [4/4] 清理临时目录...
rmdir /s /q VibeCheck-Docker-Release

echo.
echo ========================================
echo   打包完成！
echo ========================================
echo.
echo   文件: VibeCheck-Docker-v1.0.zip
echo   大小: %~z0 字节
echo.
echo   分发给朋友:
echo   1. 解压 ZIP 文件
echo   2. 双击 start.bat 启动
echo   3. 访问 http://localhost:3000
echo.
echo ========================================
echo.
pause
