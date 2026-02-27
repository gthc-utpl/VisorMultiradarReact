import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { DBZ_LEGEND } from '../../config/radars'

/* Continuous gradient string from legend colors */
const gradientColors = DBZ_LEGEND.map((item, i) => {
  const pct = (i / (DBZ_LEGEND.length - 1)) * 100
  return `${item.color} ${pct}%`
}).join(', ')

export default function ColorLegend() {
  const minimized = useStore((s) => s.legendMinimized)
  const setLegendMinimized = useStore((s) => s.setLegendMinimized)

  const [barHeight, setBarHeight] = useState(0)
  useEffect(() => {
    const handler = (e) => setBarHeight(e.detail.height || 0)
    window.addEventListener('animbar-resize', handler)
    return () => window.removeEventListener('animbar-resize', handler)
  }, [])

  return (
    <div
      className="fixed z-[999] text-white transition-all duration-200 left-2.5"
      style={{ bottom: `${barHeight + 10}px` }}
      role="region"
      aria-label="Leyenda de intensidad dBZ"
    >
      <div className="bg-gray-950/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10
        overflow-hidden">

        {/* Toggle header */}
        <button
          onClick={() => setLegendMinimized(!minimized)}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold
            hover:bg-white/5 transition-colors touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-inset"
          aria-expanded={!minimized}
        >
          {/* Mini gradient swatch */}
          <span
            className="w-3 h-3 rounded-sm shrink-0 border border-black/20"
            style={{ background: `linear-gradient(135deg, ${DBZ_LEGEND[0].color}, ${DBZ_LEGEND[4].color}, ${DBZ_LEGEND[9].color})` }}
            aria-hidden="true"
          />
          <span className="text-gray-300">Intensidad (dBZ)</span>
          <i className={`fas fa-chevron-${minimized ? 'up' : 'down'} text-[8px] text-gray-500 ml-auto`} />
        </button>

        {/* Expanded: gradient bar + labels */}
        {!minimized && (
          <div className="px-2.5 pb-2.5 pt-0.5">
            <div className="flex gap-2">
              {/* Vertical gradient bar */}
              <div
                className="w-3 rounded-sm shrink-0 border border-black/20"
                style={{
                  background: `linear-gradient(to bottom, ${gradientColors})`,
                  minHeight: `${DBZ_LEGEND.length * 18}px`,
                }}
                aria-hidden="true"
              />

              {/* Labels */}
              <div className="flex flex-col justify-between flex-1 py-px">
                {DBZ_LEGEND.map((item) => (
                  <div key={item.range} className="flex items-center gap-1.5 leading-none">
                    <span className="text-[10px] text-gray-300 tabular-nums w-8 shrink-0 text-right font-medium whitespace-nowrap">
                      {item.range}
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
