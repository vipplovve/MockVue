import React, { useContext, useState } from 'react'
import UploadFile from '../components/UploadFile'
import { Overlay } from '../components/Overlay'
import { toast } from 'react-toastify'
import UserContext from '../context/user/UserContext'

const ResumeUploader = () => {
  const [fileName, setFileName] = useState('Choose a file')
  const [loading, setLoading] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const { file, setFile , setInRole } = useContext(UserContext)

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file.')
      return
    }
    const formData = new FormData()
    formData.append('resume', file)
    try {
      setShowOverlay(true)
    } catch (err) {
      toast.error('Error uploading file. Please try again.')
      console.error(err)
    }
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    setFile(selectedFile)
    setFileName(selectedFile ? selectedFile.name : 'Choose a file')
  }

  return (
    <>
      <Overlay
        isOpen={showOverlay}
        onClose={() => {
          setShowOverlay(false)
          setLoading(false)
        }}
        loading={loading}
        setLoading={setLoading}
        setInRole={setInRole}
        setShowOverlay={setShowOverlay}
      />

      <div className="flex h-[calc(100vh-4rem)] w-full  bg-gray-800 bg-gradient-to-b from-gray-900 via-black to-black">
        <div className="w-1/2 flex items-center justify-center p-10">
          <div className="text-2xl text-blue-800 font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-snug">
            Upload Resume,
            <br />
            <span className="text-gray-200"> To Start Your Mock </span>
            <br /> Interview Journey!
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <UploadFile
            file={file}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
            handleUpload={handleUpload}
            handleFileChange={handleFileChange}
          />
        </div>
      </div>
    </>
  )
}

export default ResumeUploader
