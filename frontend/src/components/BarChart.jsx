// A small, dependency-free bar chart. Values are 0–1 (rates) or raw numbers —
// pass `format` to control the label shown above each bar.
export default function BarChart({ data, format = (v) => v, height = 180 }) {
  const max = Math.max(...data.map((d) => d.value), 0.0001)
  const barWidth = 100 / data.length

  return (
    <div className="barchart" style={{ height }}>
      <div className="barchart__bars">
        {data.map((d) => {
          const h = (d.value / max) * 100
          return (
            <div
              key={d.label}
              className="barchart__col"
              style={{ width: `${barWidth}%` }}
            >
              <span className="barchart__value">{format(d.value)}</span>
              <div className="barchart__bar" style={{ height: `${h}%` }} />
              <span className="barchart__label">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
