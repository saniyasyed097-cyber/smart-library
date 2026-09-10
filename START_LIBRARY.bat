@echo off
echo ========================================
echo    Smart Library - Starting Server...
echo ========================================
echo.

cd /d "C:\Users\syedj\.gemini\antigravity\scratch\smart-library-flask"

echo [1] Installing required packages...
py -m pip install flask flask-cors pymysql --quiet

echo [2] Starting Flask Server...
echo.
echo  Website will open at: http://localhost:5000
echo.
echo  DO NOT CLOSE THIS WINDOW while using the website!
echo ========================================

start "" "http://localhost:5000"

py app.py

pause
