@echo off
title Loan Default Prediction - FastAPI Backend (5 ML Models)
echo =====================================================================
echo Starting FastAPI Backend Server with 5 Machine Learning Models...
echo Models: Decision Tree, Gaussian NB, KNN, Logistic Regression, SVC
echo Endpoints:
echo   - Swagger API Docs: http://localhost:8000/docs
echo   - Models List:      http://localhost:8000/api/models
echo =====================================================================
python -m uvicorn backend.main:app --reload --port 8000
pause
