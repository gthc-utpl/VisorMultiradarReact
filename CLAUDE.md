# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Visor Multiradar — real-time dual weather radar viewer (GUAXX/LOXX) for GTHC-UTPL, deployed at https://clima.utpl.edu.ec

## Commands

```bash
npm run dev      # Dev server (Vite 7)
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test framework is configured.

## Architecture

React 19 + Vite 7 app with Zustand 5 state management, Leaflet maps, and Tailwind CSS 4.

### Data flow

```
API JSON indices (per julian day) → radarService (fetch/parse) → useRadarData hook
→ Zustand store (frames[], radarFrames{}) → RadarOverlay (Leaflet L.imageOverlay)
```

Radar images are served as PNGs at `{VITE_API_BASE}/data/{radarId}/{year}/{julianDay}/{filename}`. Each day has an `index.json` listing available files.

### State (src/store/useStore.js)

Single Zustand store. Key state groups: radar visibility/opacity, animation (frames timeline, playback, period, speed), loading/progress, UI (sidebar, legend, toasts), geolocation. `getCurrentFrameData()` helper matches radar records to timeline timestamps within a ±10min tolerance window.

### Hooks

- **useRadarData** — `loadLatest()` for static view, `loadAnimationData(endDate, hoursBack)` for animation, `refreshAnimationFrames(hoursBack)` for live incremental updates
- **useAnimation** — requestAnimationFrame loop with speed multiplier, auto-pause on tab hidden
- **useCurrentFrame** — derives current frame data from store

### Key components

- **AnimationBar** — playback controls, timeline slider, period/speed pills, date picker, "En vivo" live-mode toggle. Desktop and mobile layouts. Auto-play on first activation, auto-refresh every 3min in live mode.
- **FABs** — floating action buttons. Refresh button is context-aware: calls `loadLatest()` normally, `refreshAnimationFrames()` in live animation, `loadAnimationData()` with custom date.
- **RadarOverlay** — Leaflet image overlay per radar. Bounds calculated from record metadata (GUAXX) or radar center+coverage (LOXX fallback). LOXX uses scaleFactor 1.345.
- **MapView** — Leaflet container with base layer switching, coverage circles, markers.

### Services

- **radarService** — API fetching, timestamp parsing (handles GUAXX 12-digit and LOXX 14-digit formats), bounds calculation
- **imageCache** — LRU cache (max 100), batch preloading with abort support

### Configuration (src/config/radars.js)

All radar metadata, map config, animation parameters, dBZ legend colors, and base layer URLs are centralized here. `ANIMATION_CONFIG.autoRefreshInterval` controls live-mode refresh (3 min).

## Conventions

- Spanish UI text, Ecuador timezone (America/Guayaquil, UTC-5)
- Timestamps display as `HH:mm LT / HH:mm UTC`
- JSX files, no TypeScript
- Tailwind utility classes inline, no CSS modules
- ESLint rule: unused vars error except uppercase/underscored (`varsIgnorePattern: '^[A-Z_]'`)
- `customDate` in store: `null` = live mode, string value = historical mode

## Deployment

GitHub Actions on push to `main` → npm install + build → copy dist to `C:\apps\VisorMultiradarReact\dist\` → Nginx reload (Windows self-hosted runner).
