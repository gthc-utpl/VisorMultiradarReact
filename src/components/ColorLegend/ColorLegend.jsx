import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { DBZ_LEGEND } from '../../config/radars'

/* Continuous gradient string from legend colors */
const gradientColors = DBZ_LEGEND.map((item, i) => {
  const pct = (i / (DBZ_LEGEND.length - 1)) * 100
  return `${item.color} ${pct}%`
}).join(', ')

/* ── Desktop vertical panel ──────────────────────────── */
function DesktopLegend({ barHeight }) {
  const minimized = useStore((s) => s.legendMinimized)
  const setLegendMinimized = useStore((s) => s.setLegendMinimized)

  return (
    <div
      className="hidden sm:block fixed z-[999] text-white transition-all duration-200 left-2.5"
      style={{ bottom: `${barHeight + 20}px` }}
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
          <span
            className="w-3 h-3 rounded-sm shrink-0 border border-black/20"
            style={{ background: `linear-gradient(135deg, ${DBZ_LEGEND[0].color}, ${DBZ_LEGEND[4].color}, ${DBZ_LEGEND[9].color})` }}
            aria-hidden="true"
          />
          <span className="text-gray-300">Intensidad (dBZ)</span>
          <i className={`fas fa-chevron-${minimized ? 'up' : 'down'} text-[8px] text-gray-500 ml-auto`} />
        </button>

        {!minimized && (
          <div className="px-2.5 pb-2.5 pt-0.5">
            <div className="flex gap-2">
              <div
                className="w-3 rounded-sm shrink-0 border border-black/20"
                style={{
                  background: `linear-gradient(to bottom, ${gradientColors})`,
                  minHeight: `${DBZ_LEGEND.length * 18}px`,
                }}
                aria-hidden="true"
              />
              <div className="flex flex-col justify-between flex-1 py-px">
                {DBZ_LEGEND.map((item) => (
                  <div key={item.range} className="flex items-center gap-1.5 leading-none">
                    <span className="text-[10px] text-white tabular-nums w-8 shrink-0 text-right font-semibold whitespace-nowrap">
                      {item.range}
                    </span>
                    <span className="text-[10px] text-gray-300 whitespace-nowrap">
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

/* ── Mobile compact vertical panel ────────────────────── */
function MobileLegend({ barHeight }) {
  const minimized = useStore((s) => s.legendMinimized)
  const setLegendMinimized = useStore((s) => s.setLegendMinimized)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="sm:hidden fixed z-[999] text-white transition-all duration-200 left-2"
      style={{ bottom: `${barHeight + 8}px` }}
      role="region"
      aria-label="Leyenda de intensidad dBZ"
    >
      {/* Minimized: small floating button */}
      {minimized ? (
        <button
          onClick={() => setLegendMinimized(false)}
          className="flex items-center gap-1.5 bg-gray-950/90 backdrop-blur-sm rounded-lg
            shadow-xl border border-white/10 px-2 py-1.5
            active:bg-white/10 transition-colors touch-manipulation"
          aria-label="Mostrar leyenda"
        >
          <span
            className="w-4 h-4 rounded-sm shrink-0 border border-black/20"
            style={{ background: `linear-gradient(135deg, ${DBZ_LEGEND[0].color}, ${DBZ_LEGEND[4].color}, ${DBZ_LEGEND[9].color})` }}
            aria-hidden="true"
          />
          <span className="text-[10px] text-gray-400 font-semibold">dBZ</span>
          <i className="fas fa-chevron-up text-[7px] text-gray-500" />
        </button>
      ) : (
        <div className="bg-gray-950/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10
          overflow-hidden">

          {/* Header with minimize */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
              dBZ
            </span>
            <button
              onClick={() => setLegendMinimized(true)}
              className="flex items-center justify-center w-5 h-5 rounded
                text-gray-500 active:bg-white/10 transition-colors touch-manipulation"
              aria-label="Minimizar leyenda"
            >
              <i className="fas fa-chevron-down text-[7px]" />
            </button>
          </div>

          {/* Color rows — tap to toggle descriptions */}
          <div
            className="px-1.5 pb-1.5 cursor-pointer"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="flex flex-col gap-px">
              {DBZ_LEGEND.map((item) => (
                <div key={item.range} className="flex items-center gap-1 leading-none">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 border border-black/20"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[9px] text-white tabular-nums font-semibold whitespace-nowrap">
                    {item.range}
                  </span>
                  {expanded && (
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">
                      {item.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main export ─────────────────────────────────────── */
export default function ColorLegend() {
  const [barHeight, setBarHeight] = useState(0)
  useEffect(() => {
    const handler = (e) => setBarHeight(e.detail.height || 0)
    window.addEventListener('animbar-resize', handler)
    return () => window.removeEventListener('animbar-resize', handler)
  }, [])

  return (
    <>
      <DesktopLegend barHeight={barHeight} />
      <MobileLegend barHeight={barHeight} />
    </>
  )
}
