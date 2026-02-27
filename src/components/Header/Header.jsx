import useStore from '../../store/useStore'
import { useCurrentFrame } from '../../hooks/useCurrentFrame'
import { formatDateTimeFull } from '../../utils/julianDate'

export default function Header() {
  const latestRecords = useStore((s) => s.latestRecords)
  const frameData = useCurrentFrame()

  let displayTime = null
  if (frameData?.timestamp) {
    displayTime = frameData.timestamp
  } else {
    const records = Object.values(latestRecords).filter(Boolean)
    if (records.length > 0) {
      const newest = records.reduce((a, b) =>
        a.timestamp > b.timestamp ? a : b
      )
      displayTime = newest.timestamp
    }
  }

  const formatted = displayTime ? formatDateTimeFull(displayTime) : null

  return (
    <header className="bg-[#1e478e] text-white shadow-lg z-[1001] relative">
      <div className="flex items-center justify-between px-3 py-2 gap-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="https://utpl.edu.ec/recursos/img/utpl1.png"
            alt="UTPL"
            className="h-8 w-auto hidden sm:block"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold truncate">
              Sistema de Visualización Multiradar
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-200 truncate">
              Observatorio de Clima - UTPL
            </p>
          </div>
        </div>

        {/* Last update info — always visible */}
        {formatted && (
          <div className="flex items-center gap-2 shrink-0 bg-white/10 rounded-lg px-2.5 py-1.5">
            <span
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-white">{formatted.time} LT</span>
              <span className="text-[10px] text-blue-200">{formatted.date}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
