import React, { useState, useRef, useEffect } from 'react'

const RippleComponent = () => {
  const [isRecording, setIsRecording] = useState(false)
  const rippleContainerRef = useRef(null)
  const lastRippleTimeRef = useRef(0)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const streamRef = useRef(null)

  const threshold = 0.05
  const cooldown = 200

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
    return () => stopRecording()
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyserRef.current = analyser

      source.connect(analyser)
      analyze()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const analyze = () => {
    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    // Calculate RMS (audio amplitude)
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128
      sum += sample * sample
    }
    const rms = Math.sqrt(sum / bufferLength)

    // Log RMS for debugging (optional)
    console.log('RMS:', rms)

    const now = performance.now()
    if (rms > threshold && now - lastRippleTimeRef.current > cooldown) {
      const maxRms = 0.3 // Max RMS for loud voices
      const minScale = 1.0 // Small ripple
      const maxScale = 5.0 // Large ripple
      const minOpacity = 0.1 // Light ripple
      const maxOpacity = 1.0 // Dark ripple

      // Normalize RMS and calculate ripple properties
      const normalizedRms = Math.min(1, rms / maxRms)
      const rippleMaxScale = minScale + normalizedRms * (maxScale - minScale)
      const rippleInitialOpacity = minOpacity + normalizedRms * (maxOpacity - minOpacity)

      createRipple(rippleMaxScale, rippleInitialOpacity)
      lastRippleTimeRef.current = now
    }

    animationFrameRef.current = requestAnimationFrame(analyze)
  }

  const createRipple = (maxScale, initialOpacity) => {
    const ripple = document.createElement('div')
    ripple.classList.add('ripple')
    ripple.style.setProperty('--max-scale', maxScale)
    ripple.style.setProperty('--initial-opacity', initialOpacity)
    rippleContainerRef.current.appendChild(ripple)

    ripple.addEventListener('animationend', () => {
      ripple.remove()
    })
  }

  return (
    <div>
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div className="image-container">
        <img src="/user.png" className="user-image" alt="User" />
        <div ref={rippleContainerRef} className="ripple-container"></div>
      </div>
    </div>
  )
}

export default RippleComponent
