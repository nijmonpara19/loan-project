import { Link } from 'react-router-dom'
import './Home.css'

const steps = [
  {
    n: '01',
    title: 'Enter the application',
    body: 'Applicant details, financials, and loan terms — the same fields your model was trained on.',
  },
  {
    n: '02',
    title: 'Read the dial',
    body: 'A single default-probability score, plus the factors that pushed it up or down.',
  },
  {
    n: '03',
    title: 'Track the pattern',
    body: 'Every assessment is saved to your dashboard so you can spot trends across applicants.',
  },
]

export default function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <p className="home__eyebrow">Loan default risk, made legible</p>
        <h1 className="home__title">
          Know the risk
          <br />
          before you fund it.
        </h1>
        <p className="home__deck">
          Ledger turns an applicant's financial profile into a clear default-risk
          reading — in seconds, with the reasoning shown alongside the score.
        </p>
        <div className="home__cta">
          <Link to="/predict" className="home__cta-primary">
            Assess an application
          </Link>
          <Link to="/insights" className="home__cta-secondary">
            See what drives risk →
          </Link>
        </div>
      </section>

      <section className="home__steps">
        {steps.map((s) => (
          <div className="home__step" key={s.n}>
            <span className="home__step-index">{s.n}</span>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
