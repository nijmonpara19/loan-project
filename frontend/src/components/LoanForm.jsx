import { useState } from 'react'

const initialState = {
  age: '',
  education: "Bachelor's",
  employmentType: 'Full-time',
  maritalStatus: 'Single',
  monthsEmployed: '',
  income: '',
  creditScore: '',
  numCreditLines: '',
  dtiRatio: '',
  hasMortgage: 'No',
  hasDependents: 'No',
  loanAmount: '',
  interestRate: '',
  loanTerm: '36',
  loanPurpose: 'Auto',
  hasCoSigner: 'No',
}

const LOW_RISK_SAMPLE = {
  age: '56',
  education: "Bachelor's",
  employmentType: 'Full-time',
  maritalStatus: 'Married',
  monthsEmployed: '80',
  income: '85994',
  creditScore: '750',
  numCreditLines: '4',
  dtiRatio: '0.24',
  hasMortgage: 'Yes',
  hasDependents: 'Yes',
  loanAmount: '50587',
  interestRate: '5.23',
  loanTerm: '36',
  loanPurpose: 'Home',
  hasCoSigner: 'Yes',
}

const HIGH_RISK_SAMPLE = {
  age: '22',
  education: 'High School',
  employmentType: 'Unemployed',
  maritalStatus: 'Single',
  monthsEmployed: '2',
  income: '15000',
  creditScore: '350',
  numCreditLines: '9',
  dtiRatio: '0.88',
  hasMortgage: 'No',
  hasDependents: 'Yes',
  loanAmount: '140000',
  interestRate: '24.5',
  loanTerm: '60',
  loanPurpose: 'Other',
  hasCoSigner: 'No',
}

const requiredNumericFields = [
  'age',
  'monthsEmployed',
  'income',
  'creditScore',
  'numCreditLines',
  'dtiRatio',
  'loanAmount',
  'interestRate',
]

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}

export default function LoanForm({
  onSubmit,
  isLoading,
  models = [],
  selectedModelId = 'decision_tree',
  onSelectModel,
  compareMode = false,
  onToggleCompareMode,
}) {
  const [values, setValues] = useState(initialState)
  const [touched, setTouched] = useState(false)

  const update = (key) => (e) => {
    const val = e.target.value
    setValues((v) => ({ ...v, [key]: val }))
  }

  const loadSample = (sample) => {
    setValues(sample)
    setTouched(false)
  }

  const resetForm = () => {
    setValues(initialState)
    setTouched(false)
  }

  const missing = requiredNumericFields.filter((k) => values[k] === '')
  const isValid = missing.length === 0

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onSubmit(values)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Sample presets bar */}
      <div className="form__presets">
        <span className="form__presets-label">Quick test presets:</span>
        <div className="form__presets-buttons">
          <button
            type="button"
            className="preset-btn preset-btn--low"
            onClick={() => loadSample(LOW_RISK_SAMPLE)}
          >
            ✓ Low Risk Sample
          </button>
          <button
            type="button"
            className="preset-btn preset-btn--high"
            onClick={() => loadSample(HIGH_RISK_SAMPLE)}
          >
            ⚠ High Risk Sample
          </button>
          <button
            type="button"
            className="preset-btn preset-btn--reset"
            onClick={resetForm}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Section 1: Applicant */}
      <section className="form__section">
        <header className="form__section-head">
          <span className="form__index">01</span>
          <h2>Applicant Profile</h2>
        </header>
        <div className="form__grid">
          <Field label="Age (years)">
            <input
              type="number"
              min="18"
              max="100"
              value={values.age}
              onChange={update('age')}
              placeholder="35"
            />
          </Field>
          <Field label="Months Employed">
            <input
              type="number"
              min="0"
              value={values.monthsEmployed}
              onChange={update('monthsEmployed')}
              placeholder="48"
            />
          </Field>
          <Field label="Education Level">
            <select value={values.education} onChange={update('education')}>
              <option value="High School">High School</option>
              <option value="Bachelor's">Bachelor's Degree</option>
              <option value="Master's">Master's Degree</option>
              <option value="PhD">Doctorate (PhD)</option>
            </select>
          </Field>
          <Field label="Employment Type">
            <select value={values.employmentType} onChange={update('employmentType')}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </Field>
          <Field label="Marital Status">
            <select value={values.maritalStatus} onChange={update('maritalStatus')}>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Section 2: Financials */}
      <section className="form__section">
        <header className="form__section-head">
          <span className="form__index">02</span>
          <h2>Financial Standing</h2>
        </header>
        <div className="form__grid">
          <Field label="Annual Income ($)">
            <input
              type="number"
              min="0"
              value={values.income}
              onChange={update('income')}
              placeholder="75000"
            />
          </Field>
          <Field label="Credit Score (300 - 850)">
            <input
              type="number"
              min="300"
              max="850"
              value={values.creditScore}
              onChange={update('creditScore')}
              placeholder="720"
            />
          </Field>
          <Field label="Open Credit Lines">
            <input
              type="number"
              min="0"
              value={values.numCreditLines}
              onChange={update('numCreditLines')}
              placeholder="4"
            />
          </Field>
          <Field label="Debt-to-Income Ratio (0.00 - 1.00)">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={values.dtiRatio}
              onChange={update('dtiRatio')}
              placeholder="0.32"
            />
          </Field>
          <Field label="Currently Has Mortgage">
            <select value={values.hasMortgage} onChange={update('hasMortgage')}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>
          <Field label="Has Dependents">
            <select value={values.hasDependents} onChange={update('hasDependents')}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Section 3: Loan Terms */}
      <section className="form__section">
        <header className="form__section-head">
          <span className="form__index">03</span>
          <h2>Loan Terms</h2>
        </header>
        <div className="form__grid">
          <Field label="Requested Loan Amount ($)">
            <input
              type="number"
              min="0"
              value={values.loanAmount}
              onChange={update('loanAmount')}
              placeholder="25000"
            />
          </Field>
          <Field label="Interest Rate (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.interestRate}
              onChange={update('interestRate')}
              placeholder="8.50"
            />
          </Field>
          <Field label="Loan Term (Months)">
            <select value={values.loanTerm} onChange={update('loanTerm')}>
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="48">48 Months (4 Years)</option>
              <option value="60">60 Months (5 Years)</option>
            </select>
          </Field>
          <Field label="Loan Purpose">
            <select value={values.loanPurpose} onChange={update('loanPurpose')}>
              <option value="Auto">Auto</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Has Co-Signer">
            <select value={values.hasCoSigner} onChange={update('hasCoSigner')}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Section 4: Machine Learning Model Selection */}
      <section className="form__section">
        <header className="form__section-head">
          <span className="form__index">04</span>
          <h2>Machine Learning Model (5 Models Available)</h2>
        </header>

        <div className="form__models-mode">
          <label className="models-mode__toggle">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => onToggleCompareMode?.(e.target.checked)}
            />
            <span className="models-mode__toggle-slider" />
            <span className="models-mode__toggle-text">
              <strong>Compare all 5 models side-by-side</strong>
              <small>Run applicant through Decision Tree, Gaussian NB, KNN, Logistic Regression & SVC simultaneously</small>
            </span>
          </label>
        </div>

        {!compareMode && (
          <div className="models-grid">
            {models.map((m) => {
              const isSelected = selectedModelId === m.id
              return (
                <div
                  key={m.id}
                  className={`model-card ${isSelected ? 'model-card--selected' : ''}`}
                  onClick={() => onSelectModel?.(m.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectModel?.(m.id)}
                >
                  <div className="model-card__head">
                    <div className="model-card__radio">
                      <span className={`radio-dot ${isSelected ? 'radio-dot--active' : ''}`} />
                    </div>
                    <div>
                      <h4 className="model-card__name">{m.name}</h4>
                      {m.is_default && <span className="model-card__tag">Default Model</span>}
                      {m.accuracy_score && (
                        <span className="model-card__accuracy">
                          {Math.round(m.accuracy_score * 100)}% Test Acc
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="model-card__desc">{m.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {touched && !isValid && (
        <p className="form__error" role="alert">
          Please fill in all numerical fields before running inference — {missing.length} missing.
        </p>
      )}

      <button type="submit" className="form__submit" disabled={isLoading}>
        {isLoading
          ? compareMode
            ? 'Running 5 ML Models…'
            : 'Evaluating Model Risk…'
          : compareMode
            ? 'Compare All 5 Models →'
            : `Assess Risk with ${models.find((m) => m.id === selectedModelId)?.name || 'Selected Model'}`}
      </button>
    </form>
  )
}
