@echo off
title تشغيل نظام تصاريح الدخول - Access Permits System
color 0A
echo ========================================================
echo   نظام تصاريح الدخول للمنشآت والمرافق الأمنية
echo   Access Permits System (.NET 8 MVC Layered Architecture)
echo ========================================================
echo.
echo [1/2] التحقق من بيئة العمل وبناء المشروع...
dotnet build AccessPermits.sln
if %ERRORLEVEL% neq 0 (
    echo.
    echo [خطأ] فشل بناء المشروع! يرجى التأكد من تثبيت .NET 8 SDK.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] جاري تشغيل خادم الويب على المنفذ 5000...
echo يرجى فتح المتصفح على: http://localhost:5000
echo اضغط Ctrl+C لإيقاف السيرفر في أي وقت.
echo ========================================================
echo.

dotnet run --project src/AccessPermits.Web --urls "http://localhost:5000"
pause
