@echo off
title Loan Default Prediction - React Frontend (MLL)
echo =====================================================================
echo Starting React Frontend on http://localhost:5173...
echo =====================================================================
cd frontend
if not exist node_modules (
    echo [INFO] node_modules not found. Running npm install...
    npm install
)
npm run dev
pause
