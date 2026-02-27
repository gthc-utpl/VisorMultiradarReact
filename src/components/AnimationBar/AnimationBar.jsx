import { useCallback, useEffect, useState, useRef } from 'react'
import useStore from '../../store/useStore'
import { useAnimation } from '../../hooks/useAnimation'
import { useCurrentFrame } from '../../hooks/useCurrentFrame'
import { useRadarData } from '../../hooks/useRadarData'
import { ANIMATION_CONFIG } from '../../config/radars'
import { formatTimestamp, toDatetimeLocalString } from '../../utils/julianDate'
import Timeline from './Timeline'

/* ── Tiny icon button ────────────────────────────────── */
function Btn({ onClick, icon, label, disabled = false, primary = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center shrink-0 rounded-full
        transition-all duration-100 touch-manipulation
        disabled:opacity-30 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-400/60
        ${primary
          ? 'w-9 h-9 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-md shadow-blue-500/25'
          : 'w-8 h-8 hover:bg-white/10 active:bg-white/15 text-gray-300'
        }`}
    >
      <i className={`fas ${icon} ${primary ? 'text-sm' : 'text-xs'}`} />
    </button>
  )
}

/* ── Inline pill selector ────────────────────────────── */
function Pills({ options, value, onChange, disabled = false }) {
  return (
    <div className="inline-flex bg-white/5 rounded-md p-0.5 border border-white/8">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          aria-pressed={value === opt.value}
          className={`min-w-[28px] h-6 px-1.5 rounded text-[11px] font-semibold
            transition-all duration-100 touch-manipulation
            disabled:opacity-40
            focus:outline-none focus:ring-1 focus:ring-blue-400/60
            ${value === opt.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/8'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ── Main AnimationBar ────────────────────────────────── */
export default function AnimationBar() {
  const animationActive = useStore((s) => s.animationActive)
  const currentFrameIndex = useStore((s) => s.currentFrameIndex)
  const isLoading = useStore((s) => s.isLoading)
  const preloadProgress = useStore((s) => s.preloadProgress)
  const period = useStore((s) => s.period)
  const setPeriod = useStore((s) => s.setPeriod)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const frameData = useCurrentFrame()

  const [showDatePanel, setShowDatePanel] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [dateStatus, setDateStatus] = useState(null)
  const barRef = useRef(null)
  const endDateRef = useRef(null)

  const {
    nextFrame, prevFrame, goToFirst, goToLast, togglePlay,
    totalFrames, isPlaying,
  } = useAnimation()
  const { loadAnimationData } = useRadarData()

  const loadData = useCallback((endDate) => {
    setDateStatus(null)
    const date = endDate || endDateRef.current || new Date()
    endDateRef.current = date
    loadAnimationData(date, period)
  }, [loadAnimationData, period])

  useEffect(() => {
    if (animationActive) loadData()
  }, [animationActive, period])

  const handleApplyCustomDate = useCallback(() => {
    if (!customDate) {
      setDateStatus({ type: 'error', msg: 'Seleccione una fecha y hora.' })
      return
    }
    const d = new Date(customDate)
    if (d > new Date()) {
      setDateStatus({ type: 'error', msg: 'La fecha no puede ser futura.' })
      return
    }
    if ((new Date() - d) / 864e5 > 30) {
      setDateStatus({ type: 'warning', msg: 'Datos antiguos (>30 días) podrían no estar disponibles.' })
    } else {
      setDateStatus(null)
    }
    loadData(d)
  }, [loadData, customDate])

  // Keyboard shortcuts
  useEffect(() => {
    if (!animationActive) return
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break
        case 'ArrowRight':
          if (!e.target.closest('[role="slider"]')) { e.preventDefault(); nextFrame() }
          break
        case 'ArrowLeft':
          if (!e.target.closest('[role="slider"]')) { e.preventDefault(); prevFrame() }
          break
        case 'Home': e.preventDefault(); goToFirst(); break
        case 'End': e.preventDefault(); goToLast(); break
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [animationActive, togglePlay, nextFrame, prevFrame, goToFirst, goToLast])

  // Notify FABs/Legend of height changes
  useEffect(() => {
    if (!animationActive) {
      window.dispatchEvent(new CustomEvent('animbar-resize', { detail: { height: 0 } }))
      return
    }
    if (!barRef.current) return
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new CustomEvent('animbar-resize', {
        detail: { height: barRef.current?.offsetHeight || 0 }
      }))
    })
    ro.observe(barRef.current)
    return () => ro.disconnect()
  }, [animationActive])

  if (!animationActive) return null

  const currentTime = frameData?.timestamp
    ? formatTimestamp(frameData.timestamp)
    : '--:-- LT'

  const noData = totalFrames === 0
  const disabled = isLoading || noData

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-[1000]
        bg-gray-950/95 backdrop-blur-md text-white
        border-t border-white/10 shadow-[0_-2px_20px_rgba(0,0,0,0.5)]
        safe-area-bottom"
      role="region"
      aria-label="Controles de animación"
    >
      {/* Preload progress */}
      {preloadProgress && (
        <div className="h-0.5 bg-gray-800">
          <div
            className="h-full bg-blue-400 transition-[width] duration-200"
            style={{ width: `${(preloadProgress.loaded / preloadProgress.total) * 100}%` }}
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-blue-300">
          <i className="fas fa-circle-notch fa-spin text-[10px]" />
          {preloadProgress
            ? `Precargando ${preloadProgress.loaded}/${preloadProgress.total}`
            : 'Cargando…'}
        </div>
      )}

      {/* Timeline */}
      <Timeline />

      {/* ── Main controls row ── */}
      <div className="px-3 pb-2 pt-0.5">

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Time display */}
          <div className="flex items-center gap-1.5 min-w-[110px]">
            <span className="font-semibold text-sm tabular-nums tracking-wide">{currentTime}</span>
            {!noData && !isLoading && (
              <span className="text-[10px] text-gray-500 tabular-nums">
                {currentFrameIndex + 1}/{totalFrames}
              </span>
            )}
          </div>

          {/* Period pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Per</span>
            <Pills options={ANIMATION_CONFIG.periods} value={period} onChange={setPeriod} disabled={isLoading} />
          </div>

          {/* Playback controls — centered */}
          <div className="flex-1 flex items-center justify-center gap-0.5">
            <Btn onClick={goToFirst} icon="fa-backward-fast" label="Primer frame" disabled={disabled} />
            <Btn onClick={prevFrame} icon="fa-backward-step" label="Anterior" disabled={disabled} />
            <Btn onClick={togglePlay} icon={isPlaying ? 'fa-pause' : 'fa-play'} label={isPlaying ? 'Pausar' : 'Reproducir'} disabled={disabled} primary />
            <Btn onClick={nextFrame} icon="fa-forward-step" label="Siguiente" disabled={disabled} />
            <Btn onClick={goToLast} icon="fa-forward-fast" label="Último frame" disabled={disabled} />
          </div>

          {/* Speed pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Vel</span>
            <Pills options={ANIMATION_CONFIG.speeds} value={speed} onChange={setSpeed} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setShowDatePanel((v) => !v)}
              title="Consultar otra fecha"
              aria-expanded={showDatePanel}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-400/60
                ${showDatePanel
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'
                }`}
            >
              <i className="fas fa-calendar-alt text-xs" />
            </button>
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              title="Actualizar datos"
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500
                hover:text-gray-300 hover:bg-white/10 disabled:opacity-40 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <i className={`fas fa-sync-alt text-xs ${isLoading ? 'fa-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile: compact stacked */}
        <div className="sm:hidden space-y-1.5">
          {/* Time + frame count */}
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-sm tabular-nums">{currentTime}</span>
            {!noData && !isLoading && (
              <span className="text-[10px] text-gray-500 tabular-nums">
                {currentFrameIndex + 1}/{totalFrames}
              </span>
            )}
          </div>

          {/* Playback + action buttons */}
          <div className="flex items-center justify-center gap-0.5">
            <Btn onClick={goToFirst} icon="fa-backward-fast" label="Primer frame" disabled={disabled} />
            <Btn onClick={prevFrame} icon="fa-backward-step" label="Anterior" disabled={disabled} />
            <Btn onClick={togglePlay} icon={isPlaying ? 'fa-pause' : 'fa-play'} label={isPlaying ? 'Pausar' : 'Reproducir'} disabled={disabled} primary />
            <Btn onClick={nextFrame} icon="fa-forward-step" label="Siguiente" disabled={disabled} />
            <Btn onClick={goToLast} icon="fa-forward-fast" label="Último frame" disabled={disabled} />
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={() => setShowDatePanel((v) => !v)}
              aria-expanded={showDatePanel}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors
                ${showDatePanel ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <i className="fas fa-calendar-alt text-xs" />
            </button>
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500
                hover:text-gray-300 disabled:opacity-40 transition-colors"
            >
              <i className={`fas fa-sync-alt text-xs ${isLoading ? 'fa-spin' : ''}`} />
            </button>
          </div>

          {/* Period + Speed in one row */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">Per</span>
              <Pills options={ANIMATION_CONFIG.periods} value={period} onChange={setPeriod} disabled={isLoading} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">Vel</span>
              <Pills options={ANIMATION_CONFIG.speeds} value={speed} onChange={setSpeed} />
            </div>
          </div>
        </div>

        {/* ── Custom date panel (expandable) ── */}
        {showDatePanel && (
          <div className="mt-2 bg-gray-800/50 rounded-lg border border-white/8 p-2.5
            animate-[slideDown_0.15s_ease-out]">
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="custom-date-input"
                  className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold"
                >
                  Fecha final — se cargarán {period}h previas
                </label>
                <input
                  id="custom-date-input"
                  type="datetime-local"
                  value={customDate || toDatetimeLocalString(new Date())}
                  onChange={(e) => { setCustomDate(e.target.value); setDateStatus(null) }}
                  max={toDatetimeLocalString(new Date())}
                  className="w-full bg-gray-900/60 text-white text-xs px-2.5 h-8
                    rounded-md border border-white/15
                    focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30
                    [color-scheme:dark]"
                />
              </div>
              <button
                onClick={handleApplyCustomDate}
                disabled={isLoading}
                className="h-8 px-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                  text-white text-xs font-semibold rounded-md transition-colors shrink-0
                  disabled:opacity-50 touch-manipulation
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Cargar
              </button>
            </div>

            {dateStatus && (
              <div className={`mt-2 flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-md
                ${dateStatus.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : ''}
                ${dateStatus.type === 'warning' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : ''}
              `}>
                <i className={`fas text-[10px] shrink-0
                  ${dateStatus.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}
                `} />
                <span>{dateStatus.msg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
