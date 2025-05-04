import React, { useContext, useState } from 'react'
import { Loader } from './Loader'
import axiosInstance from '../utils/axiosInstance'
import UserContext from '../context/user/UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Btn from './Btn'

export const Overlay = ({ isOpen, onClose, loading, setLoading, setInRole, setShowOverlay }) => {
  const nav = useNavigate()
  const [mainMenu, setMainMenu] = useState(true)
  const [loadingMSG, setLoadingMSG] = useState('Uploading...')
  const { file, setResumeData } = useContext(UserContext)
  const [roles, setRoles] = useState([])
  const [showRoles, setShowRoles] = useState(false)
  const [level, setLevel] = useState('fresher')

  const categorize = async () => {
    setLoading(true)
    setLoadingMSG('Parsing Resume...')
    const formData = new FormData()
    formData.append('resume', file)
    await axiosInstance.post('/api/parse', formData)
    setLoadingMSG('Categorizing Resume...')
    const { data } = await axiosInstance.get('/ML/categorize')
    setMainMenu(false)
    setShowRoles(true)
    setRoles(data.roles)
    setLoading(false)
  }

  const handleInterview = async (role) => {
    try {
      setLoading(true)
      setLoadingMSG('Setting up interview...')
      const { data } = await axiosInstance.post('/genAi/genInterview', {
        role,
        difficulty: level,
        count: 3
      })
      console.log(data)
      setLoading(false)
      setShowOverlay(false)
      nav(`/interview/${data.interviewId}`)
    } catch (err) {
      toast.error('Error setting up interview. Please try again.')
      console.error(err)
    }
  }

  const handleResumeAnalysis = async () => {
    setMainMenu(false)
    setLoading(true)
    setLoadingMSG('Analyzing Resume...')
    try {
      const { data } = await axiosInstance.post('/genAi/genResumeAnalysis', {
        role: 'Software Engineer',
        level: 'fresher'
      })
      setResumeData(data)
      setShowOverlay(false)
      nav('/resumeAnalysis')
      setLoading(false)
    } catch (err) {
      toast.error('Error analyzing resume. Please try again.')
      console.error(err)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black z-50 flex items-center justify-center">
          <button className="absolute top-4 left-4 text-white text-2xl font-bold" onClick={onClose}>
            &times;
          </button>
          <div className="flex flex-col items-center justify-center gap-y-30">
            <Loader loading={loading} setLoading={setLoading} />
            {loading && (
              <div className="text-4xl text-gray-200 font-extrabold tracking-tight leading-snug text-center ml-8">
                {loadingMSG}
              </div>
            )}
            {showRoles && (
              <div className="flex flex-col items-center justify-center gap-y-14">
                <div className="text-4xl text-gray-200 font-extrabold tracking-tight leading-snug text-center">
                  These are the Role that fit your resume,
                  <br /> Select the role you are interested to give the interview for:
                </div>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                  {roles.map((role, index) => (
                    <Btn key={index} content={role} onClick={() => handleInterview(role)} />
                  ))}
                </div>
              </div>
            )}

            {!loading && mainMenu && (
              <div className="flex flex-col items-center justify-center gap-y-14">
                <div className="text-4xl text-gray-200 font-extrabold tracking-tight leading-snug text-center">
                  Select the option you want to proceed with:
                </div>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                  <Btn content="Mock Interview" onClick={categorize} />
                  <Btn content="Resume Analysis" onClick={handleResumeAnalysis} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
