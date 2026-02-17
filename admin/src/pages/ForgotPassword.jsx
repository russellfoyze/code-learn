import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../config'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setResult('')
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/user/admin/forgot-password', {
        username,
        email,
      })
      if (res.data.success) {
        setResult(res.data.password)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full'>
        <h1 className='text-2xl font-bold mb-4'>Forgot Password</h1>
        <form onSubmit={onSubmit}>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Admin Username</p>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type='text' placeholder='Enter Admin Username' required />
          </div>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Email</p>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type='email' placeholder='Enter Registered Email' required />
          </div>
          <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type='submit' disabled={loading}>
            {loading ? 'Checking...' : 'Show Password'}
          </button>
        </form>
        <div className='mt-4 text-sm'>
          <Link className='text-blue-600 underline' to='/'>Back to Login</Link>
        </div>
        {result && (
          <div className='mt-4 p-3 border rounded-md bg-gray-50'>
            <p className='text-sm text-gray-700'>Password</p>
            <p className='font-mono break-all'>{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
