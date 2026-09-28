@echo off
title Skander Bike & Mechanic Workshop Software
color 0A

:: Ensure Node.js & npm are in PATH (supporting F:\node js and default C:\ locations)
set "PATH=F:\node js;C:\Program Files\nodejs;C:\Users\%USERNAME%\AppData\Roaming\npm;%PATH%"

cd /d "%~dp0"

echo =====================================================================
echo       SKANDER SPARE PARTS & MECHANIC WORKSHOP MANAGEMENT SOFTWARE
echo =====================================================================
echo.
echo [1] Server start ho raha hai...
echo [2] Browser khud ba khud 5-6 second mein open ho jayega!
echo.
echo NOTE: Baraye meharbani is black window ko band (cross) mat karein jab tak software use karna ho.
echo =====================================================================
echo.

:: Automatically open browser once server initializes
start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:3000"

:: Start Next.js development server
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo =====================================================================
    echo Agar koi masla aya ho to neeche error parhein:
    echo =====================================================================
    pause
)
