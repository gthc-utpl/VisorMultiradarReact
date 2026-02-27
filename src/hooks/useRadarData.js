import { useCallback } from 'react'
import useStore from '../store/useStore'
import { RADARS } from '../config/radars'
import {
  fetchLatestRecord,
  fetchRecordsForPeriod,
  getAllImageUrls,
} from '../services/radarService'
import { startPreload, abortPendingLoads } from '../services/imageCache'

export function useRadarData() {
  const setLatestRecord = useStore((s) => s.setLatestRecord)
  const setIsLoading = useStore((s) => s.setIsLoading)
  const setPreloadProgress = useStore((s) => s.setPreloadProgress)
  const setFrames = useStore((s) => s.setFrames)
  const setRadarFrames = useStore((s) => s.setRadarFrames)
  const setCurrentFrameIndex = useStore((s) => s.setCurrentFrameIndex)
  const addToast = useStore((s) => s.addToast)

  const loadLatest = useCallback(async () => {
    setIsLoading(true, 'Cargando datos más recientes...')
    const radarIds = Object.keys(RADARS)

    try {
      const results = await Promise.allSettled(
        radarIds.map((id) => fetchLatestRecord(id))
      )

      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          setLatestRecord(radarIds[i], result.value)
        }
      })

      const loaded = results.filter(
        (r) => r.status === 'fulfilled' && r.value
      ).length
      if (loaded === 0) {
        addToast('No se encontraron datos recientes', 'warning')
      }
    } catch (err) {
      addToast('Error al cargar datos: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [setLatestRecord, setIsLoading, addToast])

  const loadAnimationData = useCallback(
    async (endDate, hoursBack) => {
      setIsLoading(true, 'Cargando datos para animación...')
      abortPendingLoads()

      const radarIds = Object.keys(RADARS)

      try {
        const allRadarRecords = {}
        const timestampSet = new Set()

        const results = await Promise.allSettled(
          radarIds.map((id) => fetchRecordsForPeriod(id, endDate, hoursBack))
        )

        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            allRadarRecords[radarIds[i]] = result.value
            result.value.forEach((r) => timestampSet.add(r.timestamp.getTime()))
          } else {
            allRadarRecords[radarIds[i]] = []
          }
        })

        const timestamps = Array.from(timestampSet)
          .sort((a, b) => a - b)
          .map((t) => new Date(t))

        if (timestamps.length === 0) {
          addToast('No hay datos disponibles para el periodo seleccionado', 'warning')
          setIsLoading(false)
          return
        }

        setRadarFrames(allRadarRecords)
        setFrames(timestamps)
        setCurrentFrameIndex(0)

        // Preload images
        setIsLoading(true, 'Precargando imágenes...')
        const allUrls = radarIds.flatMap((id) =>
          getAllImageUrls(allRadarRecords[id] || [])
        )

        if (allUrls.length > 0) {
          await startPreload(allUrls, (progress) => {
            setPreloadProgress(progress)
          })
        }

        setPreloadProgress(null)
        addToast(
          `${timestamps.length} frames cargados correctamente`,
          'success'
        )
      } catch (err) {
        if (err.name !== 'AbortError') {
          addToast('Error al cargar animación: ' + err.message, 'error')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [setIsLoading, setRadarFrames, setFrames, setCurrentFrameIndex, setPreloadProgress, addToast]
  )

  return { loadLatest, loadAnimationData }
}
