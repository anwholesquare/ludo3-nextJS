'use client'

import LudoPlay from '@/components/ludo-play'

export default function PlayPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full screen Ludo game */}
      <div className="fixed inset-0 w-screen h-screen">
        <LudoPlay />
      </div>
      

      
      {/* Game instructions overlay */}
      <div className="absolute top-4 right-4 z-10 text-right max-w-xs">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
          <h1 className="text-xl font-bold mb-3 font-space-grotesk">🎲 Ludo Game</h1>
          
          <div className="space-y-2 text-sm">
           
            
            <div className="border-b border-white/20 pb-2 mb-2">
              <h3 className="font-semibold text-blue-300">Camera Controls</h3>
              <div className="space-y-1 text-xs">
                <p><kbd className="px-1 py-0.5 bg-white/20 rounded">SPACE</kbd> Auto-rotate</p>
                <p><kbd className="px-1 py-0.5 bg-white/20 rounded">R</kbd> Reset Camera</p>
                <p><span className="text-gray-300">Drag:</span> Rotate View</p>
                <p><span className="text-gray-300">Scroll:</span> Zoom In/Out</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-yellow-300">Board</h3>
             
            </div>
          </div>
        </div>
      </div>
      
      {/* Game status overlay - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
          <h3 className="text-sm font-semibold mb-2 text-center">🎮 Game Status</h3>
          <div className="text-xs space-y-1">
            <p className="text-green-300">Ready to Play!</p>
            <p className="text-gray-300">Roll dice to start</p>
          </div>
        </div>
      </div>
    </div>
  )
}
