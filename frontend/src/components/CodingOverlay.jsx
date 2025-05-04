import React, { useEffect } from 'react'

const CodingOverlay = ({
  codeOverlay,
  question,
  pseudoCode,
  setPseudoCode,
  timeLeft,
  setTimeLeft,
  handleSubmit
}) => {
  useEffect(() => {
    if (!codeOverlay) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [codeOverlay])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (!codeOverlay) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 text-white flex z-50">
      <div className="w-1/2 p-6 border-r border-gray-700 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Coding Question</h2>
        <p>
          {question}
        </p>
      </div>

      <div className="w-1/2 p-6 flex flex-col">
        <div className="text-right text-lg font-semibold mb-4">
          ⏱️ Time Left: {formatTime(timeLeft)}
        </div>
        <textarea
          className="flex-1 w-full bg-gray-900 text-white p-4 rounded resize-none outline-none"
          placeholder="Write your pseudo code here..."
          value={pseudoCode}
          onChange={(e) => setPseudoCode(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default CodingOverlay
