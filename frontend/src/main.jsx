import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserState from './context/user/UserState.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <UserState>
    <App />
    </UserState>
  </>
)
