# Ledger — Loan Default Risk Predictor (5 Models Suite)

A high-performance React (Vite + React Router) frontend for loan default risk prediction, fully integrated with a production FastAPI backend supporting **5 machine learning models**.

## The 5 Models Integrated
1. **Decision Tree Classifier** (`decision_tree` — default, ~88% test accuracy)
2. **Gaussian Naive Bayes** (`gaussian_nb`)
3. **K-Nearest Neighbors** (`knn`)
4. **Logistic Regression** (`logistic_regression`)
5. **Support Vector Classifier** (`svc`)

---

## How to Run

### Step 1: Start the Friend's Backend
From the repository root (`loan-default-prediction - Copy`):
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Models Endpoint: `http://localhost:8000/api/models`

### Step 2: Start the MLL Frontend
From the `MLL` directory:
```bash
cd MLL
npm install   # (only needed if node_modules is missing)
npm run dev
```
Opens at `http://localhost:5173`.

---

## Features

- **Model Selection**: Switch between any of the 5 trained ML models with individual descriptions and accuracy badges.
- **5-Model Comparative Matrix**: Toggle "Compare all 5 models side-by-side" to run simultaneous predictions and see consensus analysis.
- **Quick Test Presets**: "Low Risk Sample" and "High Risk Sample" buttons to test predictions immediately without typing 16 fields.
- **Risk Needle Dial**: Animated SVG gauge showing real-time probability needle deflection and category tier.
- **Multi-Model Dashboard**: Track historical assessments with filter-by-model chips.
- **Live Health Indicator**: Navbar status pill reflecting real-time backend connectivity and active models.
