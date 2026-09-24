import { useEffect, useState } from 'react'

// Polar-to-cartesian helper for drawing the tick marks around the dial.
function pointOnArc(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 180) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function RiskGauge({ probability, label, isLoading }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (probability == null) {
      setAnimated(0)
      return
    }
    // Animate the needle sweeping into place rather than snapping.
    const start = performance.now()
    const duration = 900
    const from = animated
    const to = probability
    let raf
    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimated(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probability])

  const cx = 140
  const cy = 140
  const r = 108
  const needleAngle = -90 + animated * 180

  const ticks = Array.from({ length: 11 }, (_, i) => i * 18)

  const color =
    label === 'Low' ? 'var(--teal)' : label === 'High' ? 'var(--rust)' : 'var(--amber)'

  return (
    <div className="gauge">
      <svg viewBox="0 0 280 170" className="gauge__svg" role="img" aria-label="Default risk dial">
        <defs>
          <linearGradient id="gaugeArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--teal)" />
            <stop offset="50%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="var(--rust)" />
          </linearGradient>
        </defs>

        {/* base track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* colored arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity={probability == null ? 0.35 : 1}
        />

        {ticks.map((deg, i) => {
          const outer = pointOnArc(cx, cy, r + 12, deg)
          const inner = pointOnArc(cx, cy, r + 2, deg)
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--bone-dim)"
              strokeWidth="1"
            />
          )
        })}

        {/* needle */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.05s linear',
          }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 22} stroke={color} strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r="7" fill={color} />
      </svg>

      <div className="gauge__reading">
        {probability == null ? (
          <>
            <span className="gauge__value gauge__value--idle">—</span>
            <span className="gauge__label">Awaiting application</span>
          </>
        ) : (
          <>
            <span className="gauge__value" style={{ color }}>
              {Math.round(animated * 100)}%
            </span>
            <span className="gauge__label" style={{ color }}>
              {isLoading ? 'Assessing…' : `${label} risk`}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
