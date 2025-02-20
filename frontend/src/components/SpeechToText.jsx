import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'

const SpeechToText = () => {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [finalText, setFinalText] = useState('') 
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const textRef = useRef('') 

  const toggleListening = () => {
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
      }

      recognitionRef.current = recognition
    }

    if (isListening) {
      stopListening()
    } else {
      setText('')
      setFinalText('')
      textRef.current = ''
      recognitionRef.current.start()
      resetSilenceTimer()
    }

    setIsListening(!isListening)
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
      <p className="text-xl font-semibold">{text || 'Press Start and Speak...'}</p>
      <button
        onClick={toggleListening}
        className={`px-4 py-2 mt-4 text-white rounded ${
          isListening ? 'bg-red-500' : 'bg-blue-500'
        }`}
      >
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      {finalText && (
        <p className="mt-4 text-lg font-bold text-green-600">Final Text: {finalText}</p>
      )}
    </div>
  )
}

export default SpeechToText
