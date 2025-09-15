'use client'

import LudoSimulation from '@/components/ludo-simulation'
import Navigation from '@/components/navigation'

export default function SimulatePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full screen Ludo simulation container */}
      <div className="fixed inset-0 w-screen h-screen">
        <LudoSimulation />
      </div>
      
      {/* Overlay UI elements */}
      <div className="absolute top-4 left-4 z-10">
        <Navigation />
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute top-4 right-4 z-10 text-right">
        <h1 className="text-2xl font-bold text-white mb-2 font-space-grotesk drop-shadow-lg">Ludo Board</h1>
        <p className="text-white mb-2 font-inter drop-shadow-lg">
          <kbd className="px-2 py-1 bg-black bg-opacity-50 rounded text-white font-space-grotesk">SPACE</kbd> Camera Orbit
        </p>
        <p className="text-white font-inter drop-shadow-lg">
          Click Board: Change Theme
        </p>
      </div>
    </div>
  )
}
