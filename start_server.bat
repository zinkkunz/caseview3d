
@echo off
title DentalViewer Server (Auto-Restart)
cd /d "%~dp0"

:loop
cls
echo =====================================================
echo   Dental 3D Viewer Server - Auto Restart Mode
echo =====================================================
echo Starting 'npm run dev'...
echo.

call npm run dev

echo.
echo =====================================================
echo   WARNING: Server stopped or crashed!
echo   Restarting in 3 seconds...
echo =====================================================
timeout /t 3 >nul
goto loop
