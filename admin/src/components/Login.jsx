import React, { useState } from 'react'
import axios from "axios"
import { backendUrl } from '../config'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = ({setToken}) => {

  const [username , setUsername]= useState('')
  const [password , setPassword]= useState('')
  const navigate = useNavigate()

  const onSubmitHandler = async (e)=>{
    try {
      e.preventDefault();
      const response = await axios.post(backendUrl + '/api/user/admin/login' , {username, password})
      if (response.data.success) {
          setToken(response.data.token)
        
      }
      else{
        toast.error(response.data.message)
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
        <form  onSubmit={onSubmitHandler}> 
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Username</p>
            <input onChange={(e)=>setUsername(e.target.value)} value={username} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="text" placeholder='Enter Admin Username' required />
          </div>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder='Enter Admin Password' required />
          </div>
          <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type='submit'>Login</button>
        </form>
        <button type="button" className="text-blue-600 underline mt-2" onClick={()=>navigate('/forgot')} style={{background:'none', border:'none', cursor:'pointer'}}>Forgot Password?</button>
      </div>
    </div>
  )
}

export default Login
