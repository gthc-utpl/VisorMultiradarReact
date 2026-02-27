import { RADARS } from '../config/radars'
import { getDaysInRange, getDateRange } from '../utils/julianDate'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

function buildIndexUrl(radarId, year, julianDay) {
  return `${API_BASE}${RADARS[radarId].dataPath}/${year}/${julianDay}/index.json`
}

function buildImageUrl(radarId, year, julianDay, filename) {
  return `${API_BASE}${RADARS[radarId].dataPath}/${year}/${julianDay}/${filename}`
}

/**
 * Parse timestamp from a record.
 * GUAXX: has `timestamp_local` (12 digits: YYYYMMDDHHmm) or `datetime_local` string
 * LOXX:  has `timestamp` (14 digits: YYYYMMDDHHmmss) or `datetime_local` string
 * Fallback: parse from filename (12 or 14 digits)
 */
function parseRecordTimestamp(record) {
  // Try datetime_local first (format: "2026-02-27 08:20" or "2026-02-27 08:20:00")
  if (record.datetime_local) {
    const d = new Date(record.datetime_local.replace(' ', 'T'))
    if (!isNaN(d)) return d
  }

  // Try timestamp fields (LOXX uses `timestamp`, GUAXX uses `timestamp_local`)
  const tsStr = record.timestamp_local || record.timestamp
  if (tsStr) {
    const s = String(tsStr)
    const year = parseInt(s.slice(0, 4))
    const month = parseInt(s.slice(4, 6)) - 1
    const day = parseInt(s.slice(6, 8))
    const hour = parseInt(s.slice(8, 10))
    const minute = parseInt(s.slice(10, 12))
    return new Date(year, month, day, hour, minute)
  }

  // Fallback: extract digits from filename
  const match = record.filename.match(/(\d{12,14})/)
  if (match) {
    const s = match[1]
    const year = parseInt(s.slice(0, 4))
    const month = parseInt(s.slice(4, 6)) - 1
    const day = parseInt(s.slice(6, 8))
    const hour = parseInt(s.slice(8, 10))
    const minute = parseInt(s.slice(10, 12))
    return new Date(year, month, day, hour, minute)
  }

  return null
}

/**
 * Extract the files array from index.json.
 * The JSON can be:
 *  - An object with a `files` property (actual format)
 *  - A plain array (legacy/fallback)
 */
function extractFiles(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.files)) return data.files
  return []
}

export async function fetchLatestRecord(radarId) {
  const radar = RADARS[radarId]
  if (!radar) throw new Error(`Unknown radar: ${radarId}`)

  const now = new Date()
  const days = getDaysInRange(
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // look back 2 days
    now
  )

  // Search from most recent day backwards
  for (let i = days.length - 1; i >= 0; i--) {
    const { year, julianDay } = days[i]
    try {
      const data = await fetchJson(buildIndexUrl(radarId, year, julianDay))
      const files = extractFiles(data)
      if (files.length === 0) continue

      // First element is the most recent in this format
      const latest = files[0]
      const ts = parseRecordTimestamp(latest)

      return {
        ...latest,
        radarId,
        url: buildImageUrl(radarId, year, julianDay, latest.filename),
        timestamp: ts,
      }
    } catch {
      continue
    }
  }
  return null
}

export async function fetchRecordsForPeriod(radarId, endDate, hoursBack) {
  const radar = RADARS[radarId]
  if (!radar) throw new Error(`Unknown radar: ${radarId}`)

  const { start, end } = getDateRange(endDate, hoursBack)
  const days = getDaysInRange(start, end)
  const allRecords = []

  for (const { year, julianDay } of days) {
    try {
      const data = await fetchJson(buildIndexUrl(radarId, year, julianDay))
      const files = extractFiles(data)

      for (const record of files) {
        const ts = parseRecordTimestamp(record)
        if (ts && ts >= start && ts <= end) {
          allRecords.push({
            ...record,
            radarId,
            url: buildImageUrl(radarId, year, julianDay, record.filename),
            timestamp: ts,
          })
        }
      }
    } catch {
      continue
    }
  }

  allRecords.sort((a, b) => a.timestamp - b.timestamp)
  return allRecords
}

export function calculateBounds(radarId, record) {
  const radar = RADARS[radarId]

  // Use bounds from the record if available (GUAXX has per-file bounds)
  if (record.bounds) {
    const [[latMin, lonMin], [latMax, lonMax]] = record.bounds
    const latCenter = (latMin + latMax) / 2
    const lonCenter = (lonMin + lonMax) / 2
    const latHalf = ((latMax - latMin) / 2) * radar.scaleFactor
    const lonHalf = ((lonMax - lonMin) / 2) * radar.scaleFactor
    return [
      [latCenter - latHalf, lonCenter - lonHalf],
      [latCenter + latHalf, lonCenter + lonHalf],
    ]
  }

  // Fallback: calculate from radar center + coverage (LOXX has no per-file bounds)
  const kmPerDegreeLat = 111.32
  const kmPerDegreeLon = kmPerDegreeLat * Math.cos((radar.lat * Math.PI) / 180)
  const latOffset = (radar.coverageKm / kmPerDegreeLat) * radar.scaleFactor
  const lonOffset = (radar.coverageKm / kmPerDegreeLon) * radar.scaleFactor

  return [
    [radar.lat - latOffset, radar.lon - lonOffset],
    [radar.lat + latOffset, radar.lon + lonOffset],
  ]
}

export function getAllImageUrls(records) {
  return records.map((r) => r.url)
}
