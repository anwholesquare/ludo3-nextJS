'use client'

import LudoPlay from '@/components/ludo-play'

export default function PlayPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full screen Ludo game */}
      <div className="fixed inset-0 w-screen h-screen">
        <LudoPlay />
      </div>
    </div>
  )
}
