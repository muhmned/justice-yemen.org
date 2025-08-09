@echo off
echo ========================================
echo    تشغيل نظام إدارة المحتوى
echo ========================================
echo.

echo [1/4] تشغيل الباك إند...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo [2/4] انتظار تشغيل الباك إند...
timeout /t 5 /nobreak > nul

echo [3/4] تشغيل الفرونت إند...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo [4/4] انتظار تشغيل الفرونت إند...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo    تم تشغيل النظام بنجاح!
echo ========================================
echo.
echo الواجهة الأمامية: http://localhost:3000
echo لوحة الإدارة: http://localhost:3000/admin
echo API الخادم: http://localhost:5000
echo.
echo اضغط أي مفتاح لإغلاق هذا النافذة...
pause > nul 