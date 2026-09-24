"""
FastAPI backend for the Ledger loan-default predictor, backed by the real
trained model (loan_default_model.pkl — a scikit-learn DecisionTreeClassifier).

Run it:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

--------------------------------------------------------------------------
IMPORTANT — how this maps to the model
--------------------------------------------------------------------------
The .pkl was inspected directly (model.feature_names_in_) rather than
trusting the notebook, because the notebook's later cells (integer-mapping
categoricals) don't match what the model was actually trained on and never
reach a training/fit step. The model expects 24 columns, in this exact
order, produced by one-hot encoding with drop_first=True:

  Age, Income, LoanAmount, CreditScore, MonthsEmployed, NumCreditLines,
  InterestRate, LoanTerm, DTIRatio,
  Education_High School, Education_Master's, Education_PhD,
  EmploymentType_Part-time, EmploymentType_Self-employed, EmploymentType_Unemployed,
  MaritalStatus_Married, MaritalStatus_Single,
  HasMortgage_Yes, HasDependents_Yes,
  LoanPurpose_Business, LoanPurpose_Education, LoanPurpose_Home, LoanPurpose_Other,
  HasCoSigner_Yes

The "dropped" baseline category for each one-hot group (all-zero row) is:
  Education: Bachelor | EmploymentType: Full-time | MaritalStatus: Divorced
  HasMortgage: No | HasDependents: No | LoanPurpose: Auto | HasCoSigner: No

The frontend's Education and LoanPurpose dropdowns were trimmed to only the
categories the model was actually trained on (see LoanForm.jsx) — passing an
unseen category would silently encode as the baseline and skew the result.
--------------------------------------------------------------------------
"""

from pathlib import Path
from typing import List, Literal

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "loan_default_model.pkl"
FRONTEND_DIST = BASE_DIR.parent / "dist"  # populated by `npm run build`

app = FastAPI(title="Ledger Loan Default Predictor")

# Only needed if the frontend is hosted on a different origin than this API
# (e.g. separate Vercel + Render deploy). Add that origin below, or set it
# via the FRONTEND_ORIGIN env var. Not needed when FastAPI serves the built
# frontend itself (see the StaticFiles mount at the bottom of this file).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    # Matches any Vercel-hosted frontend (production + preview deployments),
    # e.g. https://ledger-app.vercel.app or https://ledger-app-git-branch.vercel.app
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load(MODEL_PATH)
FEATURE_ORDER: List[str] = list(model.feature_names_in_)


# ---------------------------------------------------------------------------
# Request schema — mirrors LoanForm.jsx's `values` object. Literal types on
# every categorical field mean FastAPI/Pydantic reject anything outside what
# the model was trained on, with a clear 422 error instead of a silent
# mis-encoding.
# ---------------------------------------------------------------------------

class LoanApplication(BaseModel):
    age: float
    income: float
    loanAmount: float
    creditScore: float
    monthsEmployed: float
    numCreditLines: float
    interestRate: float
    loanTerm: float
    dtiRatio: float
    education: Literal["High School", "Bachelor", "Master", "PhD"]
    employmentType: Literal["Full-time", "Part-time", "Self-employed", "Unemployed"]
    maritalStatus: Literal["Single", "Married", "Divorced"]
    hasMortgage: Literal["No", "Yes"]
    hasDependents: Literal["No", "Yes"]
    loanPurpose: Literal["Auto", "Business", "Education", "Home", "Other"]
    hasCoSigner: Literal["No", "Yes"]


class PredictionResponse(BaseModel):
    probability: float
    label: Literal["Low", "Moderate", "High"]
    topFactors: List[str]


# ---------------------------------------------------------------------------
# Build the exact 24-column one-hot row the model expects, in order.
# ---------------------------------------------------------------------------

def build_feature_row(a: LoanApplication) -> np.ndarray:
    row = {name: 0.0 for name in FEATURE_ORDER}

    row["Age"] = a.age
    row["Income"] = a.income
    row["LoanAmount"] = a.loanAmount
    row["CreditScore"] = a.creditScore
    row["MonthsEmployed"] = a.monthsEmployed
    row["NumCreditLines"] = a.numCreditLines
    row["InterestRate"] = a.interestRate
    row["LoanTerm"] = a.loanTerm
    row["DTIRatio"] = a.dtiRatio

    if a.education == "High School":
        row["Education_High School"] = 1.0
    elif a.education == "Master":
        row["Education_Master's"] = 1.0
    elif a.education == "PhD":
        row["Education_PhD"] = 1.0
    # "Bachelor" is the dropped baseline -> leave all Education_* at 0

    if a.employmentType == "Part-time":
        row["EmploymentType_Part-time"] = 1.0
    elif a.employmentType == "Self-employed":
        row["EmploymentType_Self-employed"] = 1.0
    elif a.employmentType == "Unemployed":
        row["EmploymentType_Unemployed"] = 1.0
    # "Full-time" is the dropped baseline

    if a.maritalStatus == "Married":
        row["MaritalStatus_Married"] = 1.0
    elif a.maritalStatus == "Single":
        row["MaritalStatus_Single"] = 1.0
    # "Divorced" is the dropped baseline

    if a.hasMortgage == "Yes":
        row["HasMortgage_Yes"] = 1.0

    if a.hasDependents == "Yes":
        row["HasDependents_Yes"] = 1.0

    if a.loanPurpose == "Business":
        row["LoanPurpose_Business"] = 1.0
    elif a.loanPurpose == "Education":
        row["LoanPurpose_Education"] = 1.0
    elif a.loanPurpose == "Home":
        row["LoanPurpose_Home"] = 1.0
    elif a.loanPurpose == "Other":
        row["LoanPurpose_Other"] = 1.0
    # "Auto" is the dropped baseline

    if a.hasCoSigner == "Yes":
        row["HasCoSigner_Yes"] = 1.0

    return np.array([[row[name] for name in FEATURE_ORDER]])


# ---------------------------------------------------------------------------
# topFactors — the tree itself has no per-applicant explanation built in
# (that would need something like SHAP), so this surfaces plain-language
# flags on the numeric fields the model's own feature_importances_ rank
# highest, using thresholds drawn from the training data's own distribution
# (see Task_4.ipynb's df.describe() output: e.g. DTIRatio 75th pct ~0.7,
# InterestRate 75th pct ~19.25, CreditScore 25th pct ~437).
# ---------------------------------------------------------------------------

def top_factors(a: LoanApplication) -> List[str]:
    factors = []

    loan_to_income = a.loanAmount / max(a.income, 1.0)
    if loan_to_income > 3:
        factors.append("Loan large relative to income")

    if a.interestRate > 19:
        factors.append("Elevated interest rate")

    if a.creditScore < 480:
        factors.append("Credit score below range")

    if a.monthsEmployed < 12:
        factors.append("Short employment history")

    if a.dtiRatio > 0.7:
        factors.append("High debt-to-income ratio")

    return factors[:3] or ["No major risk drivers detected"]


def to_label(probability: float) -> Literal["Low", "Moderate", "High"]:
    if probability < 0.33:
        return "Low"
    if probability < 0.66:
        return "Moderate"
    return "High"


@app.post("/api/predict", response_model=PredictionResponse)
def predict(application: LoanApplication) -> PredictionResponse:
    features = build_feature_row(application)
    probability = float(model.predict_proba(features)[0][1])  # P(Default = 1)
    return PredictionResponse(
        probability=probability,
        label=to_label(probability),
        topFactors=top_factors(application),
    )


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Serve the built frontend (npm run build -> ../dist) from this same FastAPI
# app, so a single deployed service handles both the API and the UI with no
# CORS config needed. Only mounts if dist/ exists, so `uvicorn --reload`
# still works fine during frontend development.
# ---------------------------------------------------------------------------

if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
