@echo off
title SIG Turismo - Cusco
echo ==========================================
echo    SISTEMA GERENCIAL DE TURISMO - CUSCO
echo ==========================================
echo.
echo Iniciando modulos del sistema...
echo.

start "Backend" cmd /c "run_backend.bat"
start "Frontend" cmd /c "run_frontend.bat"

echo El sistema se esta ejecutando en ventanas separadas.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
