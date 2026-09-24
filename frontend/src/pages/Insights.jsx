import BarChart from '../components/BarChart.jsx'
import {
  defaultRateByEmployment,
  defaultRateByCreditBand,
  defaultRateByDti,
  featureImportance,
  summaryStats,
} from '../data/insightsData.js'
import './Insights.css'

const pct = (v) => `${Math.round(v * 100)}%`

export default function Insights() {
  return (
    <div className="insights">
      <header className="insights__head">
        <p className="insights__eyebrow">Insights</p>
        <h1>What drives default risk</h1>
        <p className="insights__note">
          Sample aggregates shown below — swap these for real figures computed from your
          training dataset once your backend exposes them (see{' '}
          <code>src/data/insightsData.js</code>).
        </p>
      </header>

      <div className="insights__summary">
        <div className="insights__summary-item">
          <span className="insights__summary-value">{summaryStats.totalApplications}</span>
          <span className="insights__summary-label">Applications analyzed</span>
        </div>
        <div className="insights__summary-item">
          <span className="insights__summary-value">{summaryStats.overallDefaultRate}</span>
          <span className="insights__summary-label">Overall default rate</span>
        </div>
        <div className="insights__summary-item">
          <span className="insights__summary-value">{summaryStats.avgCreditScore}</span>
          <span className="insights__summary-label">Average credit score</span>
        </div>
        <div className="insights__summary-item">
          <span className="insights__summary-value">{summaryStats.avgLoanAmount}</span>
          <span className="insights__summary-label">Average loan amount</span>
        </div>
      </div>

      <section className="insights__chart">
        <h2>Default rate by employment type</h2>
        <BarChart data={defaultRateByEmployment} format={pct} />
      </section>

      <section className="insights__chart">
        <h2>Default rate by credit score band</h2>
        <BarChart data={defaultRateByCreditBand} format={pct} />
      </section>

      <section className="insights__chart">
        <h2>Default rate by debt-to-income ratio</h2>
        <BarChart data={defaultRateByDti} format={pct} />
      </section>

      <section className="insights__chart">
        <h2>Feature importance (model weight)</h2>
        <BarChart data={featureImportance} format={pct} />
      </section>
    </div>
  )
}
