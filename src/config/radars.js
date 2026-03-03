export const RADARS = {
  guaxx: {
    id: 'guaxx',
    name: 'GUAXX',
    location: 'Celica',
    lat: -4.0333,
    lon: -79.8667,
    coverageKm: 100,
    dataPath: 'data/guaxx',
    color: 'rgba(255, 165, 0, 0.7)',
    colorHex: '#FFA500',
    scaleFactor: 1,
    zIndex: 201,
    resolution: '250m',
    frequency: '5 min',
  },
  loxx: {
    id: 'loxx',
    name: 'LOXX',
    location: 'Loja',
    lat: -3.98687,
    lon: -79.14434,
    coverageKm: 70,
    dataPath: 'data/loxx',
    color: 'rgba(30, 144, 255, 0.7)',
    colorHex: '#1E90FF',
    scaleFactor: 1.345,
    zIndex: 200,
    resolution: '250m',
    frequency: '5 min',
  },
}

export const MAP_CONFIG = {
  center: [-4.01, -79.5],
  defaultZoom: 9,
  minZoom: 7,
  maxZoom: 12,
}

export const ANIMATION_CONFIG = {
  periods: [
    { value: 1, label: '1h' },
    { value: 2, label: '2h' },
    { value: 4, label: '4h' },
  ],
  speeds: [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ],
  defaultSpeed: 2,
  defaultPeriod: 4,
  batchSize: 10,
  frameTolerance: 10, // minutes
  maxCacheSize: 100,
  baseInterval: 1000, // ms at 1x speed
  autoRefreshInterval: 3 * 60 * 1000, // ms — auto-refresh during live animation
}

export const DBZ_LEGEND = [
  { range: '0-8', color: '#B4E6FF', description: 'Muy ligera' },
  { range: '8-16', color: '#64B4FF', description: 'Ligera' },
  { range: '16-24', color: '#0000FF', description: 'Moderada baja' },
  { range: '24-32', color: '#0080FF', description: 'Moderada' },
  { range: '32-40', color: '#00FF00', description: 'Moderada-fuerte' },
  { range: '40-48', color: '#80FF00', description: 'Fuerte' },
  { range: '48-56', color: '#FFFF00', description: 'Muy fuerte' },
  { range: '56-64', color: '#FFA500', description: 'Intensa' },
  { range: '64-72', color: '#FF0000', description: 'Muy intensa' },
  { range: '> 72', color: '#FF00FF', description: 'Extrema / granizo' },
]

export const BASE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  dark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
  },
  light: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
  },
}
