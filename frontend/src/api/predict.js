// ---------------------------------------------------------------------------
// Single seam between the React UI and the FastAPI 5-model backend.
// Connects to POST /api/predict, GET /api/models, and GET /api/health.
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_URL || ''

export const FALLBACK_MODELS = [
  {
    id: 'decision_tree',
    name: 'Decision Tree Classifier',
    description: 'Decision Tree model trained with max_depth=8 on 255k+ loan applications (~88% test accuracy).',
    is_default: true,
    version: '1.0',
    accuracy_score: 0.88,
  },
  {
    id: 'gaussian_nb',
    name: 'Gaussian Naive Bayes',
    description: 'Gaussian Naive Bayes probabilistic classifier for risk distribution.',
    is_default: false,
    version: '1.0',
    accuracy_score: null,
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors',
    description: 'K-Nearest Neighbors classifier evaluating similarity across applicant clusters.',
    is_default: false,
    version: '1.0',
    accuracy_score: null,
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    description: 'Logistic Regression classifier optimizing linear decision boundaries.',
    is_default: false,
    version: '1.0',
    accuracy_score: null,
  },
  {
    id: 'svc',
    name: 'Support Vector Classifier',
    description: 'Support Vector Classifier utilizing optimal margin hyperplanes.',
    is_default: false,
    version: '1.0',
    accuracy_score: null,
  },
]

/**
 * Normalizes user form inputs to the schema required by the FastAPI backend.
 */
export function toBackendPayload(values, modelId = 'decision_tree') {
  let education = values.education || "Bachelor's"
  if (education === 'Bachelor') education = "Bachelor's"
  if (education === 'Master') education = "Master's"

  return {
    Age: parseInt(values.age, 10),
    Income: parseFloat(values.income),
    LoanAmount: parseFloat(values.loanAmount),
    CreditScore: parseInt(values.creditScore, 10),
    MonthsEmployed: parseInt(values.monthsEmployed, 10),
    NumCreditLines: parseInt(values.numCreditLines, 10),
    InterestRate: parseFloat(values.interestRate),
    LoanTerm: parseInt(values.loanTerm, 10),
    DTIRatio: parseFloat(values.dtiRatio),
    Education: education,
    EmploymentType: values.employmentType,
    MaritalStatus: values.maritalStatus,
    HasMortgage: values.hasMortgage,
    HasDependents: values.hasDependents,
    LoanPurpose: values.loanPurpose,
    HasCoSigner: values.hasCoSigner,
    model_id: modelId,
  }
}

/**
 * Evaluates application inputs to identify human-readable contributing factors.
 */
export function extractRiskFactors(values, backendResponse) {
  const factors = []
  const dti = parseFloat(values.dtiRatio)
  const credit = parseInt(values.creditScore, 10)
  const income = parseFloat(values.income)
  const loanAmount = parseFloat(values.loanAmount)
  const monthsEmployed = parseInt(values.monthsEmployed, 10)
  const interestRate = parseFloat(values.interestRate)

  if (dti >= 0.4) {
    factors.push(`High Debt-to-Income ratio (${Math.round(dti * 100)}%) increases monthly debt burden.`)
  } else if (dti <= 0.25) {
    factors.push(`Healthy DTI ratio (${Math.round(dti * 100)}%) leaves substantial room for repayment.`)
  }

  if (credit < 580) {
    factors.push(`Subprime credit score (${credit}) indicates past delinquency risk.`)
  } else if (credit >= 740) {
    factors.push(`Excellent credit score (${credit}) signals strong credit discipline.`)
  }

  if (values.employmentType === 'Unemployed') {
    factors.push(`Unemployed status poses immediate cash-flow risk.`)
  } else if (monthsEmployed >= 36) {
    factors.push(`Stable employment history (${monthsEmployed} months) provides dependable earnings.`)
  } else if (monthsEmployed < 12) {
    factors.push(`Short employment tenure (${monthsEmployed} months) presents limited income track record.`)
  }

  if (loanAmount > income * 0.6) {
    factors.push(`Loan amount ($${loanAmount.toLocaleString()}) represents a high percentage of annual income.`)
  }

  if (interestRate >= 15) {
    factors.push(`High interest rate (${interestRate}%) significantly increases amortization cost.`)
  }

  if (values.hasCoSigner === 'Yes') {
    factors.push(`Approved co-signer guarantees secondary repayment backing.`)
  }

  if (factors.length === 0) {
    factors.push(`Applicant profile aligns with standard underwriting guidelines.`)
  }

  return factors
}

/**
 * Fetch available models from GET /api/models.
 */
export async function fetchModels() {
  try {
    const res = await fetch(`${API_BASE}/api/models`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.models && data.models.length > 0 ? data.models : FALLBACK_MODELS
  } catch (err) {
    console.warn('[API] Could not fetch models from backend, using fallback list:', err)
    return FALLBACK_MODELS
  }
}

/**
 * Health check on GET /api/health.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    if (!res.ok) return { healthy: false }
    const data = await res.json()
    return { healthy: true, ...data }
  } catch {
    return { healthy: false }
  }
}

/**
 * Predict using a chosen model.
 */
export async function predictDefault(application, modelId = 'decision_tree') {
  const payload = toBackendPayload(application, modelId)

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Prediction failed (${res.status}): ${errText}`)
  }

  const data = await res.json()

  return {
    ...data,
    modelId: data.model_id,
    modelName: data.model_name,
    prediction: data.prediction,
    predictionLabel: data.prediction_label,
    isDefault: data.is_default,
    probability: data.default_probability,
    nonDefaultProbability: data.non_default_probability,
    label: data.risk_level, // 'Low' | 'Moderate' | 'High'
    riskLevel: data.risk_level,
    summary: data.summary,
    topFactors: extractRiskFactors(application, data),
    timestamp: data.timestamp,
  }
}

/**
 * Run inference against all 5 models concurrently for side-by-side comparison.
 */
export async function predictAllModels(application, modelList = FALLBACK_MODELS) {
  const promises = modelList.map(async (model) => {
    try {
      const result = await predictDefault(application, model.id)
      return { status: 'fulfilled', model, result }
    } catch (err) {
      return { status: 'rejected', model, error: err.message }
    }
  })

  return Promise.all(promises)
}
