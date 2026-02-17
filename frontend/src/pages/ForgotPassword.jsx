import React, { useState, useContext } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/shopContext'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const { backendURL } = useContext(ShopContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setResult('')
    setLoading(true)
    try {
      const res = await axios.post(`${backendURL}/api/user/admin/forgot-password`, {
        username, email
      })
      if (res.data.success) {
        setResult(res.data.password)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
      <form onSubmit={onSubmit} className="flex flex-col w-full gap-4 mt-2 mb-2">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Admin Username"
          required
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Registered Email"
          required
        />
        <button className="bg-black text-white px-8 py-2 hover:bg-gray-800 transition-colors w-full disabled:opacity-75" type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Show Password'}
        </button>
      </form>
      <div className="text-sm mb-4">
        <Link className="text-blue-600 underline" to="/login">Back to Login</Link>
      </div>
      {result && (
        <div className="mt-2 p-3 border rounded-md bg-gray-50 w-full">
          <p className='text-sm text-gray-700'>Password</p>
          <p className="font-mono break-all">{result}</p>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
