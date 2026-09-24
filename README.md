# Loan Default Prediction System (5 Models + React Frontend)

A complete, production-ready full-stack machine learning application for evaluating and predicting loan default risk across 5 trained ML models.

---

## Folder Structure

```
Loan_Default_Prediction_Final/
├── backend/
│   ├── main.py              # FastAPI server entry point & CORS configuration
│   ├── schemas.py           # Pydantic data schemas & request/response contracts
│   ├── requirements.txt     # Python backend dependencies
│   ├── test_backend.py      # Automated API verification test suite
│   └── models/
│       ├── registry.py      # Multi-model factory registry
│       ├── decision_tree.py # Feature preprocessor & Decision Tree predictor
│       ├── sklearn_pickle.py# Predictor wrapper for saved scikit-learn models
│       └── base.py          # Abstract predictor base class
│
├── frontend/                # Complete React (Vite + React Router) web application
│   ├── src/
│   │   ├── api/predict.js   # Normalizes payload & connects to FastAPI backend
│   │   ├── components/      # LoanForm, RiskGauge dial, ResultCard, Navbar
│   │   ├── pages/           # Predict, Dashboard, Insights, About, Home
│   │   └── hooks/           # useHistory (localStorage persistent audit log)
│   ├── package.json
│   ├── vite.config.js       # Auto-proxies /api to http://localhost:8000
│   └── dist/                # Pre-built production frontend assets
│
├── models/                  # The 5 trained scikit-learn model pickle files
│   ├── DecisionTreeModel.pkl       # Decision Tree (max_depth=8, ~88% accuracy)
│   ├── GaussianNBModel.pkl         # Gaussian Naive Bayes
│   ├── KNNModel.pkl                # K-Nearest Neighbors
│   ├── LogisticRegressionModel.pkl # Logistic Regression
│   └── SVCModel.pkl                # Support Vector Classifier
│
├── start_backend.bat        # 1-Click launcher for FastAPI backend
├── start_frontend.bat       # 1-Click launcher for React frontend
└── README.md                # Project guide & instructions
```

---

## How to Run the Project

### Option A: Using 1-Click Launchers (Windows)
1. Double-click **`start_backend.bat`** (starts the FastAPI server on `http://localhost:8000`).
2. Double-click **`start_frontend.bat`** (installs dependencies if needed and launches the UI on `http://localhost:5173`).

---

### Option B: Using Terminal Commands

#### 1. Start the Backend
Open a terminal in `Loan_Default_Prediction_Final`:
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`
- Registered models: `http://localhost:8000/api/models`

#### 2. Start the Frontend
Open a second terminal in `Loan_Default_Prediction_Final`:
```bash
cd frontend
npm install   # Run once to install dependencies
npm run dev
```
- Opens at: `http://localhost:5173`

---

## Key Features

- **5 Model Selector**: Choose between Decision Tree, Gaussian Naive Bayes, K-Nearest Neighbors, Logistic Regression, and Support Vector Classifier.
- **5-Model Evaluation Matrix**: Toggle "Compare all 5 models side-by-side" to run concurrent inference across all 5 models with consensus summary.
- **Interactive SVG Risk Gauge**: Animated risk needle indicating default probability and risk level (Low, Moderate, High).
- **1-Click Test Presets**: Quick-fill "Low Risk Sample" and "High Risk Sample" buttons to test underwriting models immediately.
- **Audit Dashboard**: View past assessment history with filter-by-model chips.
- **Live Backend Status**: Header indicator confirming real-time connectivity to backend models.
