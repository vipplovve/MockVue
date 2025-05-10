import { useEffect, useRef } from 'react'

const AvatarVideo = ({ socket, sendFrames, interviewId }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
          }
        }

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (sendFrames) {
          intervalRef.current = setInterval(() => {
            if (videoRef.current && canvas) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
              const frameData = canvas.toDataURL('image/jpeg', 0.95)
              socket.emit('video-frame', { frameData, interviewId })
            }
          }, 1000)
        }

        return () => clearInterval(intervalRef.current)
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err)
      })

    if (!sendFrames && intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [sendFrames, socket])

  return (
    <div className="flex items-center justify-center w-full h-full">
      <video ref={videoRef} className="w-full h-full rounded-full object-cover" autoPlay muted />
      <canvas ref={canvasRef} width={256} height={256} className="hidden" />
    </div>
  )
}

export default AvatarVideo
