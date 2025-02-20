import React from 'react'
import SpeechToText from './components/SpeechToText'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const App = () => {
  return <>
    <SpeechToText/>
    <ToastContainer/>
  </>
}

export default App
