import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { toast } from 'react-toastify'

const socket = io('http://localhost:5000') 

const SpeechToText = () => {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [finalText, setFinalText] = useState('')
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const textRef = useRef('')

  useEffect(() => {
    socket.on('receiveData', (data) => {
      console.log('Data from server:', data)
      setText(data)
      startListening() 
    })

    return () => {
      socket.off('receiveData')
    }
  }, [])

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Your browser does not support speech recognition')
      return
    }

    if (!recognitionRef.current) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setText(transcript)
        textRef.current = transcript
        resetSilenceTimer()
      }

      recognition.onend = () => {
        setFinalText(textRef.current)
        console.log('Final Text:', textRef.current)
        socket.emit('transcribedText', textRef.current)
      }

      recognitionRef.current = recognition
    }

    setText('')
    setFinalText('')
    textRef.current = ''
    recognitionRef.current.start()
    setIsListening(true)
    resetSilenceTimer()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = setTimeout(() => {
      stopListening()
    }, 3000)
  }

  return (
    <div className="p-4 text-center">
      <p className="text-xl font-semibold">{text || 'Waiting for server data...'}</p>
      {finalText && (
        <p className="mt-4 text-lg font-bold text-green-600">Final Text: {finalText}</p>
      )}
    </div>
  )
}

export default SpeechToText
