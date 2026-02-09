@echo off
echo Deteniendo procesos de Node.js que se hayan quedado colgados...
taskkill /F /IM node.exe
echo.

echo Limpiando cache de Next.js...
if exist .next rd /s /q .next
echo.

echo Iniciando servidor de desarrollo...
npm run dev
