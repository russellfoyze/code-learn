import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/shopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const ForgotPassword = () => {
  const { backendURL } = useContext(ShopContext)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setResult("")
    setLoading(true)
    try {
      const res = await axios.post(`${backendURL}/api/user/admin/forgot-password`, {
        username: username,
        email: email,
      })
      if (res.data.success) {
        setResult(res.data.password)
      } else {
        setResult("")
        toast.error(res.data.message)
      }
    } catch (err) {
      setResult("")
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

const Login = () => {
  const { token, setToken, backendURL } = useContext(ShopContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  // Initialize userType - ensure it's never 'admin'
  const getUserType = () => {
    const stored = localStorage.getItem('userType');
    if (stored === 'admin') {
      localStorage.removeItem('userType');
      localStorage.removeItem('token');
      return 'student';
    }
    return stored === 'teacher' ? 'teacher' : 'student';
  };
  
  const [userType, setUserType] = useState(getUserType()) // student, teacher only
  const [currentState, setCurrentState] = useState('Login') // Login or Sign Up

  // Ensure userType is never set to admin
  const setUserTypeSafe = (type) => {
    if (type === 'admin') {
      console.warn('Admin type is not allowed in frontend');
      return;
    }
    setUserType(type);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      if (currentState === 'Sign Up') {
        // Registration
        let endpoint = ''
        if (userType === 'student') {
          endpoint = '/api/user/student/register'
        } else if (userType === 'teacher') {
          endpoint = '/api/user/teacher/register'
        } else {
          toast.error('Invalid user type')
          return
        }

        if (!endpoint) {
          toast.error('Please select a valid user type')
          return
        }

        const response = await axios.post(backendURL + endpoint, { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("userType", response.data.userType)
          if (response.data.userId) {
            localStorage.setItem("userId", response.data.userId)
          }
          if (response.data.userName) {
            localStorage.setItem("userName", response.data.userName)
          }
          if (response.data.userEmail) {
            localStorage.setItem("userEmail", response.data.userEmail)
          }
          toast.success(`Successfully registered as ${response.data.userType}!`)
          
          // Navigate based on user type
          if (response.data.userType === 'teacher') {
            navigate('/teacher-dashboard')
          } else {
            navigate('/')
          }
        } else {
          toast.error(response.data.message || 'Registration failed')
        }
      } else {
        // Login
        let endpoint = ''
        if (userType === 'student') {
          endpoint = '/api/user/student/login'
        } else if (userType === 'teacher') {
          endpoint = '/api/user/teacher/login'
        } else {
          toast.error('Invalid user type')
          return
        }

        if (!endpoint) {
          toast.error('Please select a valid user type')
          return
        }

        const response = await axios.post(backendURL + endpoint, { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("userType", response.data.userType)
          if (response.data.userId) {
            localStorage.setItem("userId", response.data.userId)
          }
          if (response.data.userName) {
            localStorage.setItem("userName", response.data.userName)
          }
          if (response.data.userEmail) {
            localStorage.setItem("userEmail", response.data.userEmail)
          }
          toast.success(`Successfully logged in as ${response.data.userType}!`)
          
          // Navigate based on user type
          if (response.data.userType === 'teacher') {
            navigate('/teacher-dashboard')
          } else {
            navigate('/')
          }
        } else {
          toast.error(response.data.message || 'Login failed')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred')
    }
  }

  useEffect(() => {
    if (token) {
      const storedUserType = localStorage.getItem('userType')
      // Redirect admin users away from frontend
      if (storedUserType === 'admin') {
        localStorage.removeItem('token')
        localStorage.removeItem('userType')
        localStorage.removeItem('userId')
        setToken('')
        toast.info('Admin login is available at http://localhost:5174')
        return
      }
      if (storedUserType === 'teacher') {
        navigate('/teacher-dashboard')
      } else {
        navigate('/')
      }
    }
  }, [token, navigate, setToken])

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
  }

  if (location.pathname === '/forgot') {
    return <ForgotPassword />
  }

  return (
    <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      {/* User Type Selector */}
      <div className='w-full mb-4'>
        <div className='flex gap-2 border border-gray-300 rounded-lg p-1'>
          <button
            type="button"
            onClick={() => { setUserTypeSafe('student'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => { setUserTypeSafe('teacher'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'teacher'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Teacher
          </button>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-full gap-4'>
        <div className='inline-flex items-center gap-2 mb-2 mt-4'>
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>

        {currentState === 'Sign Up' && (
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            className='w-full px-3 py-2 border border-gray-800' 
            placeholder='Name' 
            required 
          />
        )}

        <input 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          type="email" 
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='email@gmail.com' 
          required 
        />

        <input 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          type="password" 
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='Password' 
          required 
        />

        <div className='w-full flex justify-between text-sm mt-[8px]'>
          <Link className='cursor-pointer text-blue-600 hover:underline' to='/forgot'>
            Forgot Password
          </Link>
          {currentState === 'Login'
            ? <p onClick={() => { setCurrentState('Sign Up'); resetForm(); }} className='cursor-pointer text-blue-600 hover:underline'>Create Account</p>
            : <p onClick={() => { setCurrentState('Login'); resetForm(); }} className='cursor-pointer text-blue-600 hover:underline'>Login Here</p>
          }
        </div>

        <button type="submit" className='bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 transition-colors w-full'>
          {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

export default Login
