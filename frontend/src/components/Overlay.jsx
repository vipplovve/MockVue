import React, { useContext, useState } from 'react'
import { Loader } from './Loader'
import axiosInstance from '../utils/axiosInstance'
import UserContext from '../context/user/UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

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
        level,
        count: 2
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
                    <button
                      key={index}
                      onClick={() => {
                        setInRole(role)
                        setShowRoles(false)
                        handleInterview(role)
                      }}
                      className="relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-gray-600 rounded-md group"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-800 rounded-full group-hover:w-56 group-hover:h-56" />
                      <span className="absolute bottom-0 left-0 h-full -ml-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-auto h-full opacity-100 object-stretch"
                          viewBox="0 0 487 487"
                        >
                          <path
                            fillOpacity=".1"
                            fillRule="nonzero"
                            fill="#FFF"
                            d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
                          />
                        </svg>
                      </span>
                      <span className="absolute top-0 right-0 w-12 h-full -mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="object-cover w-full h-full"
                          viewBox="0 0 487 487"
                        >
                          <path
                            fillOpacity=".1"
                            fillRule="nonzero"
                            fill="#FFF"
                            d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
                          />
                        </svg>
                      </span>
                      <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200" />
                      <span className="relative text-base font-semibold">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && mainMenu && (
              <div className="flex flex-col items-center justify-center gap-y-14">
                <div className="text-4xl text-gray-200 font-extrabold tracking-tight leading-snug text-center">
                  Welcome to the Mock Interview Platform!
                </div>
                <div className="text-4xl text-gray-200 font-extrabold tracking-tight leading-snug text-center">
                  Select the option you want to proceed with:
                </div>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                  <button
                    className="hover:cursor-pointer hover:bg-blue-400 bg-blue-500 text-white px-4 py-2 rounded w-38 h-12"
                    onClick={categorize}
                  >
                    Interview
                  </button>
                  <button
                    className="hover:cursor-pointer hover:bg-green-400 bg-green-500 text-white px-4 py-2 rounded w-38 h-12"
                    onClick={handleResumeAnalysis}
                  >
                    Resume Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
