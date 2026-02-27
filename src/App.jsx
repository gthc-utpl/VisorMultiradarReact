import { useEffect, useRef } from 'react'
import Header from './components/Header/Header'
import MapView from './components/Map/MapView'
import AnimationBar from './components/AnimationBar/AnimationBar'
import Sidebar from './components/Sidebar/Sidebar'
import ColorLegend from './components/ColorLegend/ColorLegend'
import FABs from './components/FABs/FABs'
import ToastContainer from './components/common/Toast'
import LoadingOverlay from './components/common/LoadingOverlay'
import { useRadarData } from './hooks/useRadarData'

export default function App() {
  const mapRef = useRef(null)
  const { loadLatest } = useRadarData()

  useEffect(() => {
    loadLatest()
  }, [loadLatest])

  return (
    <div className="h-dvh flex flex-col bg-gray-900 overflow-hidden">
      <Header />

      {/* Map area */}
      <main className="flex-1 relative">
        <MapView mapRef={mapRef} />
        <ColorLegend />
        <FABs mapRef={mapRef} />
      </main>

      {/* Animation bar (bottom sheet) */}
      <AnimationBar />

      {/* Sidebar (drawer) */}
      <Sidebar />

      {/* Notifications */}
      <ToastContainer />
      <LoadingOverlay />
    </div>
  )
}
