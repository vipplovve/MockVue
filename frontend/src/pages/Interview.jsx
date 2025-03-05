import React, { useEffect, useState, useRef, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import UserContext from '../context/user/UserContext'
import { toast } from 'react-toastify'
import { ResultOverlay } from '../components/ResultOverlay'
import axiosInstance from '../utils/axiosInstance'

const Interview = () => {
  const { InRole } = useContext(UserContext)
  const [voiceId, setVoiceId] = useState('Joanna')
  const [countdown, setCountdown] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const [showNewAvatar, setShowNewAvatar] = useState(false)
  const [userCaption, setUserCaption] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState({})
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const socketRef = useRef(null)
  const navigate = useNavigate()
  const { interviewId } = useParams()

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsSpeaking(true)
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      const words = transcript.trim().split(/\s+/)
      setUserCaption(words.slice(-10).join(' '))

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }

      silenceTimerRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('answer', { answer: transcript })
        }
        recognition.stop()
        setUserCaption('')
        setIsSpeaking(false)
      }, 3000)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
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
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, { query: { voiceId } })
      socketRef.current = newSocket
      newSocket.on('interview-started', () => {
        newSocket.emit('next-ques', { voiceId })
      })
      newSocket.on('answer-received', () => {
        newSocket.emit('next-ques', { voiceId })
      })
      newSocket.on('interview-ended', async () => {
        toast.success('Interview Completed !')
        newSocket.emit('end-interview', { interviewId })
        setIsOpen(true)
        setLoading(true)
        console.log(1)
        const { data } = await axiosInstance.post('/genAi/evaluate', { interviewId })
        console.log(data)
        setScores(data)
        setLoading(false)
      })

      newSocket.on('tts-chunk', async ({ audio }) => {
        if (!audioContextRef.current) {
          return
        }
        try {
          const arrayBuffer = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0)).buffer
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContextRef.current.destination)
          setIsNarrating(true)
          source.start()

          source.onended = () => {
            setIsNarrating(false)
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
      return
    }
    socketRef.current.emit('start-interview', { interviewId })
  }

  const handleStart = () => {
    setCountdown(3)
    setShowNewAvatar(true)
  }

  return (
    <div className={`flex flex-col items-center ${showNewAvatar ? ' pt-36' : 'pt-16'} h-[calc(100vh-4rem)] bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black`}>
      {!showNewAvatar && <h1 className="text-4xl font-bold text-gray-200 mb-8">Role: {InRole}</h1>}
      <div className="relative flex items-center justify-center w-full h-64">
        <div
          className={`flex flex-col justify-center items-center gap-2 transition-transform duration-500 ${
            showNewAvatar ? 'translate-x-[-350px]' : ''
          }`}
        >
          <img
            src={`/${voiceId}.png`}
            className={`w-64 h-64 border-4 ${
              isNarrating ? 'border-blue-800' : 'border-gray-800'
            }  rounded-full  `}
            alt="Interviewer Avatar"
          />
          {showNewAvatar && <p className="text-xl font-bold">AI Interviewer</p>}
          {isNarrating && (
            <div className="absolute bottom-[-30%] text-lg italic text-gray-700 flex items-center justify-center gap-2">
              <svg
                class="h-8 w-8 text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <p className="font-semibold">Listen Carefully</p>
            </div>
          )}
        </div>
        {showNewAvatar && (
          <div className="flex flex-col items-center gap-2 absolute transition-transform duration-500 translate-x-[350px] mt-4">
            <img
              src="/user.png"
              className={`w-64 h-64 border-4 ${
                isSpeaking ? 'border-blue-800' : 'border-gray-800'
              } rounded-full `}
              alt="User Avatar"
            />
            <p className="text-xl font-bold">You</p>
            <p className="absolute bottom-[-30%] text-lg italic text-gray-700">{userCaption}</p>
          </div>
        )}
      </div>
      {!showNewAvatar && (
        <>
          <h1 className="mt-10 text-2xl text-gray-200 font-bold">Select AI Interviewer</h1>
          <select className='text-gray-200' value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
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
      <ResultOverlay
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          navigate('/upload')
        }}
        loading={loading}
        setLoading={setLoading}
        loadingMSG={'Analysing answers'}
        scores={scores}
      />
    </div>
  )
}

export default Interview
