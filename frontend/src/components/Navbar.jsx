import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { checkBackendHealth } from '../api/predict.js'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/predict', label: 'Predict' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/insights', label: 'Insights' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    checkBackendHealth().then((res) => setHealth(res))
    const interval = setInterval(() => {
      checkBackendHealth().then((res) => setHealth(res))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const modelCount = health?.active_models?.length ?? 5
  const isHealthy = health?.status === 'healthy'

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand-wrapper">
          <NavLink to="/" className="navbar__brand" end>
            <span className="navbar__mark" aria-hidden="true" />
            Ledger
          </NavLink>
          <div
            className="navbar__status-pill"
            title={isHealthy ? 'Connected to FastAPI friend backend' : 'Checking backend models...'}
          >
            <span className={`status-dot ${isHealthy ? 'status-dot--live' : 'status-dot--pending'}`} />
            <span>{isHealthy ? `${modelCount} ML Models Active` : '5 Models Ready'}</span>
          </div>
        </div>

        <nav className="navbar__links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' navbar__link--active' : '')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
