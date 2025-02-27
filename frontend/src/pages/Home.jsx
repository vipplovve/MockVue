import React, { useState } from 'react'
import { Overlay } from '../components/Overlay';

export const Home = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowOverlay(true)}
      >
        Show Overlay
      </button>

      <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)} />
    </div>
  )
}