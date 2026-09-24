import './About.css'

const modelsInfo = [
  {
    name: 'Decision Tree Classifier',
    tech: 'Max Depth = 8 (~88% Test Accuracy)',
    body: 'Trained on 255k+ historical loan applications. Evaluates non-linear thresholds across debt-to-income, credit score, and income ratios.',
  },
  {
    name: 'Gaussian Naive Bayes',
    tech: 'Probabilistic Distribution Classifier',
    body: 'Computes class likelihood under continuous normal distributions. Fast, resilient baseline for underwriting distribution risk.',
  },
  {
    name: 'K-Nearest Neighbors (KNN)',
    tech: 'Instance-Based Similarity',
    body: 'Classifies applicants by locating the closest historical borrower profiles across multidimensional normalized feature space.',
  },
  {
    name: 'Logistic Regression',
    tech: 'Sigmoidal Boundary Optimizer',
    body: 'Provides clean probabilistic calibration by computing log-odds ratios across all 28 encoded loan parameters.',
  },
  {
    name: 'Support Vector Classifier (SVC)',
    tech: 'Optimal Margin Hyperplane',
    body: 'Maximizes the geometric margin separating defaulters and non-defaulters across applicant hyperplanes.',
  },
]

const factors = [
  {
    name: 'Credit score (FICO)',
    body: 'Primary indicator of borrower payment discipline. Lower scores significantly increase predicted default odds.',
  },
  {
    name: 'Debt-to-income (DTI) ratio',
    body: "Portion of applicant income pre-committed to debt. High DTI leaves little buffer against unexpected financial shocks.",
  },
  {
    name: 'Loan amount vs. income',
    body: 'Evaluates leverage ratio. Substantial loan amounts relative to earnings require higher underwriting diligence.',
  },
  {
    name: 'Interest rate & term duration',
    body: 'Higher rates and longer maturities multiply monthly burden and cumulative interest repayment obligations.',
  },
  {
    name: 'Employment tenure & type',
    body: 'Extended, stable employment provides predictable cash flow, lowering default likelihood.',
  },
  {
    name: 'Co-signer presence',
    body: 'Having a verified co-signer dramatically reduces risk by providing enforceable secondary backing.',
  },
]

export default function About() {
  return (
    <div className="about">
      <header className="about__head">
        <p className="about__eyebrow">Methodology</p>
        <h1>How Ledger scores an application</h1>
        <p className="about__intro">
          Ledger connects to a production FastAPI backend to score applicant profiles across 5
          trained Machine Learning classifiers, evaluating demographic, financial, and loan term attributes.
        </p>
      </header>

      <section className="about__section">
        <h2>5 Integrated ML Models</h2>
        <div className="about__factors">
          {modelsInfo.map((m) => (
            <div className="about__factor" key={m.name}>
              <span className="about__model-tech">{m.tech}</span>
              <h3>{m.name}</h3>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about__section">
        <h2>What the models weigh</h2>
        <div className="about__factors">
          {factors.map((f) => (
            <div className="about__factor" key={f.name}>
              <h3>{f.name}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about__section">
        <h2>Reading a result</h2>
        <ul className="about__list">
          <li>
            <span className="about__dot about__dot--low" /> Low (&lt;25%) — profile matches
            borrowers with reliable repayment records.
          </li>
          <li>
            <span className="about__dot about__dot--moderate" /> Moderate (25% - 49%) — some risk
            indicators present; recommended for manual review or collateral pledge.
          </li>
          <li>
            <span className="about__dot about__dot--high" /> High (≥50%) — compounding risk factors;
            flagged for elevated default risk.
          </li>
        </ul>
        <p className="about__disclaimer">
          Ledger's multi-model outputs serve as an underwriting decision-support tool to complement
          human credit officer judgement.
        </p>
      </section>
    </div>
  )
}
