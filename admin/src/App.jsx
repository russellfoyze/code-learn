import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes , Route} from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import TeacherRequests from './pages/TeacherRequests'
import Newsletter from './pages/Newsletter'
import Chat from './pages/Chat'
import Login from './components/Login';
// import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer} from 'react-toastify';
import ForgotPassword from './pages/ForgotPassword'
import { useLocation } from 'react-router-dom'
 
 
 export const backendUrl = import.meta.env.VITE_BACKEND_URL;
 export const currency = '৳'
 
 
function App() {

  const [token , setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):"")

  useEffect (()=>{
    localStorage.setItem('token', token)
  },[token])

  const location = useLocation()
  const isForgot = location.pathname === '/forgot'

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {/* Public routes */}
      <Routes>
        <Route path='/forgot' element={<ForgotPassword/>}/>
      </Routes>
      {/* Auth gate */}
      {token === "" && !isForgot ? (
        <Login setToken={setToken} />
      ) : null}
      {token !== "" ? (
        <>
          <Navbar setToken={setToken}/>
          <hr />
          <div className='flex w-full h-[calc(100vh-80px)] overflow-hidden'>
            <Sidebar/>
            <div className='flex-1 overflow-y-auto ml-[max(5vw , 25px)] my-8 text-gray-600 text-base pr-[max(5vw , 25px)]'>
              <Routes>
                <Route path='/add' element={<Add token={token} />}/>
                <Route path='/list' element={<List token={token}/>}/>
                <Route path='/orders' element={<Orders token={token}/>}/>
                <Route path='/teacher-requests' element={<TeacherRequests token={token}/>}/>
                <Route path='/newsletter' element={<Newsletter token={token}/>}/>
                <Route path='/chat' element={<Chat token={token}/>}/>
              </Routes>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default App
