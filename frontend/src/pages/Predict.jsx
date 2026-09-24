import { useEffect, useState } from 'react'
import LoanForm from '../components/LoanForm.jsx'
import ResultCard from '../components/ResultCard.jsx'
import RiskGauge from '../components/RiskGauge.jsx'
import {
  predictDefault,
  predictAllModels,
  fetchModels,
  FALLBACK_MODELS,
} from '../api/predict.js'
import { useHistory } from '../hooks/useHistory.js'
import './Predict.css'

export default function Predict() {
  const [models, setModels] = useState(FALLBACK_MODELS)
  const [selectedModelId, setSelectedModelId] = useState('decision_tree')
  const [compareMode, setCompareMode] = useState(false)
  const [result, setResult] = useState(null)
  const [compareResults, setCompareResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addEntry } = useHistory()

  useEffect(() => {
    fetchModels().then((data) => {
      if (data && data.length > 0) {
        setModels(data)
        const defaultModel = data.find((m) => m.is_default)
        if (defaultModel) setSelectedModelId(defaultModel.id)
      }
    })
  }, [])

  async function handleSubmit(values) {
    setIsLoading(true)
    setError(null)
    try {
      if (compareMode) {
        // Run all 5 models concurrently
        const responses = await predictAllModels(values, models)
        setCompareResults(responses)

        // Select the primary model result to show on the gauge
        const activeRes =
          responses.find((r) => r.status === 'fulfilled' && r.model.id === selectedModelId) ||
          responses.find((r) => r.status === 'fulfilled')

        if (activeRes && activeRes.result) {
          setResult(activeRes.result)
        }

        // Save each fulfilled result to history
        responses.forEach((r) => {
          if (r.status === 'fulfilled' && r.result) {
            addEntry({
              income: values.income,
              loanAmount: values.loanAmount,
              creditScore: values.creditScore,
              probability: r.result.probability,
              label: r.result.label,
              modelName: r.result.modelName,
              modelId: r.result.modelId,
              predictionLabel: r.result.predictionLabel,
            })
          }
        })
      } else {
        // Single model prediction
        const prediction = await predictDefault(values, selectedModelId)
        setResult(prediction)
        setCompareResults(null)
        addEntry({
          income: values.income,
          loanAmount: values.loanAmount,
          creditScore: values.creditScore,
          probability: prediction.probability,
          label: prediction.label,
          modelName: prediction.modelName,
          modelId: prediction.modelId,
          predictionLabel: prediction.predictionLabel,
        })
      }
    } catch (err) {
      console.error('[Predict Error]', err)
      setError(err.message || 'Could not complete the assessment. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Click on a model in compare view to focus its needle & factors
  const inspectModelResult = (res) => {
    if (res?.result) {
      setResult(res.result)
      setSelectedModelId(res.result.modelId)
    }
  }

  // Compute 5-model consensus
  const fulfilledResults = compareResults
    ? compareResults.filter((r) => r.status === 'fulfilled').map((r) => r.result)
    : []
  const defaultCount = fulfilledResults.filter((r) => r.isDefault).length
  const totalCount = fulfilledResults.length

  return (
    <div className="predict">
      {/* Aside Risk Panel */}
      <aside className="predict__panel">
        <div className="predict__panel-inner">
          <p className="predict__eyebrow">Ledger ML Suite</p>
          <h1 className="predict__title">
            Read the risk
            <br />
            before you sign.
          </h1>
          <p className="predict__deck">
            Powered by 5 machine learning models trained on 255k+ loan applications:
            Decision Tree, Gaussian Naive Bayes, KNN, Logistic Regression & SVC.
          </p>

          {/* Model selector dropdown in sidebar */}
          <div className="predict__model-indicator">
            <span className="predict__model-label">Inspecting Model:</span>
            <select
              value={selectedModelId}
              onChange={(e) => {
                const newId = e.target.value
                setSelectedModelId(newId)
                if (compareResults) {
                  const match = compareResults.find(
                    (r) => r.status === 'fulfilled' && r.model.id === newId
                  )
                  if (match?.result) setResult(match.result)
                }
              }}
              className="predict__model-select"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <RiskGauge
            probability={result?.probability ?? null}
            label={result?.label}
            isLoading={isLoading}
          />

          {error && <p className="predict__error">{error}</p>}

          <ResultCard result={result} />
        </div>
      </aside>

      {/* Main Form & Results Area */}
      <main className="predict__main">
        <div className="predict__main-inner">
          {/* 5-Model Comparative Matrix view if compare mode was executed */}
          {compareResults && compareResults.length > 0 && (
            <section className="compare-section">
              <div className="compare-section__header">
                <span className="compare-section__eyebrow">Multi-Model Analysis</span>
                <h2>5-Model Evaluation Matrix</h2>
                <div className={`compare-consensus compare-consensus--${defaultCount > 0 ? 'warning' : 'safe'}`}>
                  <span className="consensus-dot" />
                  <span>
                    <strong>Consensus: </strong>
                    {defaultCount === 0
                      ? `All ${totalCount} models agree: No Default (Safe)`
                      : `${totalCount - defaultCount} of ${totalCount} predict Safe, ${defaultCount} flag Default Risk`}
                  </span>
                </div>
              </div>

              <div className="compare-grid">
                {compareResults.map((r, i) => {
                  const isCurrent = result?.modelId === r.model.id
                  if (r.status === 'rejected') {
                    return (
                      <div key={i} className="compare-card compare-card--error">
                        <div className="compare-card__head">
                          <h4>{r.model.name}</h4>
                          <span className="compare-card__badge compare-card__badge--error">Error</span>
                        </div>
                        <p className="compare-card__error-text">{r.error}</p>
                      </div>
                    )
                  }

                  const res = r.result
                  const isHigh = res.label === 'High'
                  const isMod = res.label === 'Moderate'
                  const badgeClass = isHigh ? 'rust' : isMod ? 'amber' : 'teal'

                  return (
                    <div
                      key={r.model.id}
                      className={`compare-card ${isCurrent ? 'compare-card--active' : ''}`}
                      onClick={() => inspectModelResult(r)}
                    >
                      <div className="compare-card__head">
                        <div>
                          <h4 className="compare-card__title">{r.model.name}</h4>
                          <span className="compare-card__id">{r.model.id}</span>
                        </div>
                        <span className={`compare-card__badge badge--${badgeClass}`}>
                          {res.label} Risk
                        </span>
                      </div>

                      <div className="compare-card__prob-row">
                        <div className="compare-card__prob">
                          <span className="compare-card__prob-val">
                            {Math.round(res.probability * 100)}%
                          </span>
                          <span className="compare-card__prob-label">Default Risk</span>
                        </div>
                        <div className="compare-card__verdict">
                          <span className="compare-card__verdict-title">Verdict</span>
                          <span className="compare-card__verdict-label">{res.predictionLabel}</span>
                        </div>
                      </div>

                      <div className="compare-card__mini-bar">
                        <div
                          className="compare-card__mini-bar-fill"
                          style={{
                            width: `${Math.round(res.probability * 100)}%`,
                            backgroundColor: isHigh ? 'var(--rust)' : isMod ? 'var(--amber)' : 'var(--teal)',
                          }}
                        />
                      </div>

                      <p className="compare-card__summary">{res.summary}</p>

                      <div className="compare-card__action">
                        {isCurrent ? (
                          <span className="compare-card__current-pill">● Active on dial</span>
                        ) : (
                          <span className="compare-card__inspect-link">Click to inspect on dial →</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <p className="predict__form-eyebrow">Loan application assessment</p>
          <LoanForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            models={models}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            compareMode={compareMode}
            onToggleCompareMode={setCompareMode}
          />
        </div>
      </main>
    </div>
  )
}
