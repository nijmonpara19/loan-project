export default function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="result result--empty">
        <p>Submit an application to see its default risk assessment, model verdict, and driving factors.</p>
      </div>
    )
  }

  const {
    label = 'Low',
    modelName = 'ML Model',
    predictionLabel,
    default_probability,
    non_default_probability,
    probability,
    summary,
    topFactors = [],
  } = result

  const defaultProb = probability ?? default_probability ?? 0
  const nonDefaultProb = non_default_probability ?? Math.max(0, 1 - defaultProb)

  return (
    <div className={`result result--${label.toLowerCase()}`}>
      {/* Model & Verdict Badge */}
      <div className="result__model-header">
        <span className="result__model-pill">{modelName}</span>
        <span className={`result__badge result__badge--${label.toLowerCase()}`}>
          {predictionLabel || `${label} Risk`}
        </span>
      </div>

      {/* Probabilities Breakdown Bar */}
      <div className="result__breakdown">
        <div className="result__breakdown-labels">
          <span>Repay Probability: <strong>{Math.round(nonDefaultProb * 100)}%</strong></span>
          <span>Default Risk: <strong>{Math.round(defaultProb * 100)}%</strong></span>
        </div>
        <div className="result__bar-track">
          <div
            className="result__bar-fill result__bar-fill--safe"
            style={{ width: `${Math.round(nonDefaultProb * 100)}%` }}
            title={`Repay likelihood: ${Math.round(nonDefaultProb * 100)}%`}
          />
          <div
            className="result__bar-fill result__bar-fill--risk"
            style={{ width: `${Math.round(defaultProb * 100)}%` }}
            title={`Default risk: ${Math.round(defaultProb * 100)}%`}
          />
        </div>
      </div>

      {/* Backend Underwriting Summary */}
      {summary && (
        <div className="result__summary-box">
          <h4>Model Assessment</h4>
          <p>{summary}</p>
        </div>
      )}

      {/* Key Factors */}
      {topFactors.length > 0 && (
        <div className="result__factors">
          <h3>Key Influencing Factors</h3>
          <ul>
            {topFactors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
