import React, { useEffect, useState, useRef, useContext } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import UserContext from '../context/user/UserContext'

const Interview = () => {
  const { role } = useContext(UserContext)
  const [voiceId, setVoiceId] = useState('Joanna')
  const [countdown, setCountdown] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [showNewAvatar, setShowNewAvatar] = useState(false)
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const socketRef = useRef(null)

  const { interviewId } = useParams()

  const startRecording = () => {
    console.log('Starting voice recognition...')
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.error('Speech Recognition API is not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('Voice recognition started')
      setIsSpeaking(true)
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      console.log('Transcript:', transcript)

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }

      silenceTimerRef.current = setTimeout(() => {
        console.log('User was silent for 3 seconds. Sending answer...')
        if (socketRef.current) {
          socketRef.current.emit('answer', { answer: transcript })
        }
        recognition.stop()
        setIsSpeaking(false)
      }, 3000)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      console.log('Voice recognition stopped')
      setIsSpeaking(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      })
    }

    if (!socketRef.current) {
      const newSocket = io('http://localhost:3001', { query: { voiceId } })
      socketRef.current = newSocket
      newSocket.on('interview-started', () => {
        newSocket.emit('next-ques', { voiceId })
      })
      newSocket.on('answer-received', () => {
        newSocket.emit('next-ques', { voiceId })
      })
      newSocket.on('interview-ended', () => {
        alert('Interview completed!')
      })
      newSocket.on('tts-chunk', async ({ audio }) => {
        if (!audioContextRef.current) {
          console.error('AudioContext is not initialized!')
          return
        }
        try {
          const arrayBuffer = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0)).buffer
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContextRef.current.destination)
          source.start()

          source.onended = () => {
            startRecording()
          }
        } catch (err) {
          console.error('Error decoding audio data:', err)
        }
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      setInterviewStarted(true)
      startInterview()
      return
    }
    if (countdown !== null) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const startInterview = () => {
    if (!socketRef.current) {
      console.error('Socket not initialized!')
      return
    }
    socketRef.current.emit('start-interview', { interviewId })
  }

  const handleStart = () => {
    setCountdown(3)
    setShowNewAvatar(true)
  }

  return (
    <div className={`flex flex-col items-center ${showNewAvatar ? ' mt-54' : 'mt-28'} h-screen`}>
      {!showNewAvatar && <h1 className="text-4xl font-bold mb-8">Role: {role}</h1>}
      <div className="relative flex items-center justify-center w-full h-64">
        <div
          className={`flex flex-col justify-center items-center gap-2 transition-transform duration-500 ${
            showNewAvatar ? 'translate-x-[-350px]' : ''
          }`}
        >
          <img
            src={`/${voiceId}.png`}
            className={'w-64 h-64 border-4 border-gray-800 rounded-full '}
            alt="Interviewer Avatar"
          />
          {showNewAvatar && <p className="text-xl font-bold">AI Interviewer</p>}
        </div>
        {showNewAvatar && (
          <div className="flex flex-col justify-center items-center gap-2 absolute transition-transform duration-500 translate-x-[350px]">
            <img
              src="/user.png"
              className=" w-64 h-64 border-4 border-gray-800 rounded-full "
              alt="User Avatar"
            />
            <p className="text-xl font-bold">You</p>
          </div>
        )}
      </div>
      {!showNewAvatar && (
        <>
          <h1 className="mt-10 text-2xl font-bold">Select AI Interviewer</h1>
          <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
            <option value="Joanna">US Female (Joanna)</option>
            <option value="Matthew">US Male (Matthew)</option>
            <option value="Amy">British Female (Amy)</option>
            <option value="Brian">British Male (Brian)</option>
          </select>
        </>
      )}

      {showNewAvatar && (
        <div className="absolute top-40 left-1/2  h-1/2 border-l-3 border-gray-800"></div>
      )}

      {!showNewAvatar && (
        <button
          onClick={handleStart}
          className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
          disabled={countdown !== null}
        >
          Start Interview
        </button>
      )}
      {countdown !== null && countdown !== 0 && (
        <p className="mt-32 text-3xl font-bold"> Starting in {countdown}</p>
      )}
    </div>
  )
}

export default Interview
