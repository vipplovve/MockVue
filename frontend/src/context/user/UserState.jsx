import { useState, useEffect } from 'react'
import UserContext from './UserContext'
import axiosInstance from '../../utils/axiosInstance'

const UserState = (props) => {
  const [currUser, setCurrUser] = useState(null)
  const [InRole, setInRole] = useState('Software Engineer')
  const [file, setFile] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const getUser = async () => {
    try {
      const { data } = await axiosInstance.get('/auth/user')
      setCurrUser(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return (
    <UserContext.Provider value={{ currUser, setCurrUser, getUser, InRole, setInRole , file, setFile, resumeData, setResumeData}}>
      {props.children}
    </UserContext.Provider>
  )
}

export default UserState
