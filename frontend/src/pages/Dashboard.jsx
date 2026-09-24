import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory.js'
import './Dashboard.css'

function formatCurrency(n) {
  return `$${Number(n).toLocaleString()}`
}

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  const { history, clearHistory } = useHistory()
  const [modelFilter, setModelFilter] = useState('ALL')

  const total = history.length
  const highRisk = history.filter((h) => h.label === 'High').length
  const avgProbability = total
    ? history.reduce((sum, h) => sum + h.probability, 0) / total
    : 0

  const uniqueModels = Array.from(
    new Set(history.map((h) => h.modelName || 'Decision Tree Classifier'))
  )

  const displayedHistory =
    modelFilter === 'ALL'
      ? history
      : history.filter(
          (h) => (h.modelName || 'Decision Tree Classifier') === modelFilter
        )

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <div>
          <p className="dashboard__eyebrow">Dashboard</p>
          <h1>Prediction history</h1>
        </div>
        {total > 0 && (
          <button className="dashboard__clear" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </header>

      {total === 0 ? (
        <div className="dashboard__empty">
          <p>No assessments yet. Run an application using any of the 5 models from the Predict page and it will show up here.</p>
          <Link to="/predict" className="dashboard__empty-cta">
            Assess an application →
          </Link>
        </div>
      ) : (
        <>
          <div className="dashboard__stats">
            <div className="dashboard__stat">
              <span className="dashboard__stat-value">{total}</span>
              <span className="dashboard__stat-label">Total assessed</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value">{highRisk}</span>
              <span className="dashboard__stat-label">Flagged high risk</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value">{Math.round(avgProbability * 100)}%</span>
              <span className="dashboard__stat-label">Average risk score</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value">{uniqueModels.length}</span>
              <span className="dashboard__stat-label">Active models tested</span>
            </div>
          </div>

          {uniqueModels.length > 1 && (
            <div className="dashboard__filter-bar">
              <span className="dashboard__filter-label">Filter by Model:</span>
              <div className="dashboard__filter-chips">
                <button
                  className={`dashboard__chip ${modelFilter === 'ALL' ? 'dashboard__chip--active' : ''}`}
                  onClick={() => setModelFilter('ALL')}
                >
                  All Models ({history.length})
                </button>
                {uniqueModels.map((m) => (
                  <button
                    key={m}
                    className={`dashboard__chip ${modelFilter === m ? 'dashboard__chip--active' : ''}`}
                    onClick={() => setModelFilter(m)}
                  >
                    {m} ({history.filter((h) => (h.modelName || 'Decision Tree Classifier') === m).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          <table className="dashboard__table">
            <thead>
              <tr>
                <th>When</th>
                <th>Model</th>
                <th>Income</th>
                <th>Loan amount</th>
                <th>Credit score</th>
                <th>Risk</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.map((h, i) => (
                <tr key={h.id} style={{ '--row-index': i }}>
                  <td>{formatDate(h.timestamp)}</td>
                  <td>
                    <span className="dashboard__model-tag">
                      {h.modelName || 'Decision Tree Classifier'}
                    </span>
                  </td>
                  <td>{formatCurrency(h.income)}</td>
                  <td>{formatCurrency(h.loanAmount)}</td>
                  <td>{h.creditScore}</td>
                  <td>{Math.round(h.probability * 100)}%</td>
                  <td>
                    <span className={`dashboard__badge dashboard__badge--${h.label.toLowerCase()}`}>
                      {h.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
