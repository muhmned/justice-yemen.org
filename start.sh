#!/bin/bash

echo "========================================"
echo "   تشغيل نظام إدارة المحتوى"
echo "========================================"
echo

echo "[1/4] تشغيل الباك إند..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "[2/4] انتظار تشغيل الباك إند..."
sleep 5

echo "[3/4] تشغيل الفرونت إند..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "[4/4] انتظار تشغيل الفرونت إند..."
sleep 10

echo
echo "========================================"
echo "   تم تشغيل النظام بنجاح!"
echo "========================================"
echo
echo "الواجهة الأمامية: http://localhost:3000"
echo "لوحة الإدارة: http://localhost:3000/admin"
echo "API الخادم: http://localhost:5000"
echo
echo "اضغط Ctrl+C لإيقاف الخوادم..."

# انتظار إشارة الإيقاف
trap "echo 'إيقاف الخوادم...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 