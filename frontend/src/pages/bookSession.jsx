import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/shopContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'

const BookSession = () => {
  const { productId } = useParams()
  const { products, token, backendURL } = useContext(ShopContext)
  const navigate = useNavigate()
  const [teacherData, setTeacherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const discordLink = 'https://discord.gg/GCs69PMx'

  // Form states
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [sessionType, setSessionType] = useState('online')
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('') // 'bkash' or 'card'

  // Available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  // Duration options
  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ]

  useEffect(() => {
    // Find teacher data
    const teacher = products.find(item => item._id === productId)
    if (teacher) {
      setTeacherData(teacher)
      // Pre-fill session title with teacher's name
      setSessionTitle(`Session with ${teacher.fullName}`)
    }
  }, [productId, products])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please login to book a session')
      navigate('/login')
      return
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setLoading(true)

    try {
      const sessionData = {
        teacherId: productId,
        title: sessionTitle,
        description: sessionDescription,
        scheduledDate: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        duration: duration,
        type: sessionType,
        specialRequests: specialRequests,
        price: calculateTotalPrice(),
        paymentMethod: paymentMethod
      }

      const response = await axios.post(`${backendURL}/api/sessions/book`, sessionData, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Session booked successfully!')
        // Show Discord modal before navigating
        setShowDiscordModal(true)
        // Auto navigate after 10 seconds, or let user close manually
        setTimeout(() => {
          setShowDiscordModal(false)
          navigate(`/product/${productId}`)
        }, 10000)
      } else {
        toast.error(response.data.message || 'Failed to book session')
      }

    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to book session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const calculateTotalPrice = () => {
    if (!teacherData?.hourlyRate) return 0
    return (teacherData.hourlyRate * duration) / 60
  }

  if (!teacherData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>👨‍🏫</div>
          <h2 className='text-2xl font-bold text-gray-600 mb-2'>Loading Teacher...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        {/* Header */}
        <div className='mb-8'>
          <button 
            onClick={() => navigate(`/product/${productId}`)}
            className='flex items-center text-blue-600 hover:text-blue-800 mb-4'
          >
            <span className='mr-2'>←</span>
            Back to Teacher Profile
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Book a Session</h1>
          <p className='text-gray-600 mt-2'>Schedule a session with {teacherData.fullName}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          
          {/* Teacher Info Card */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-lg p-6 sticky top-8'>
              <div className='text-center mb-6'>
                <div className='w-24 h-24 mx-auto mb-4 relative'>
                  {(() => {
                    // Same logic as product page - get first image from array or use string
                    let imageUrl = null;
                    if (teacherData.image) {
                      if (Array.isArray(teacherData.image) && teacherData.image.length > 0) {
                        imageUrl = teacherData.image[0];
                      } else if (typeof teacherData.image === 'string') {
                        imageUrl = teacherData.image;
                      }
                    }
                    if (!imageUrl && teacherData.profileImageUrl) {
                      imageUrl = teacherData.profileImageUrl;
                    }
                    
                    return imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={teacherData.fullName || 'Teacher'}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-3xl'>
                        👨‍🏫
                      </div>
                    );
                  })()}
                </div>
                <h3 className='text-xl font-bold text-gray-900'>{teacherData.fullName}</h3>
                <p className='text-blue-600 font-medium'>{teacherData.professionalTitle}</p>
                {teacherData.location && (
                  <p className='text-sm text-gray-600 mt-1'>📍 {teacherData.location}</p>
                )}
              </div>

              <div className='space-y-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>৳{teacherData.hourlyRate || 0}/hr</div>
                  <div className='text-sm text-gray-500'>Hourly Rate</div>
                </div>

                {teacherData.availability && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Availability</h4>
                    <p className='text-sm text-gray-600'>{teacherData.availability}</p>
                  </div>
                )}

                {teacherData.responseTime && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Response Time</h4>
                    <p className='text-sm text-gray-600'>{teacherData.responseTime}</p>
                  </div>
                )}

                {teacherData.specialties && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Specialties</h4>
                    <div className='flex flex-wrap gap-1'>
                      {teacherData.specialties.split(',').slice(0, 3).map((specialty, index) => (
                        <span key={index} className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                          {specialty.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Session Details</h2>
              
              <form onSubmit={handleSubmit} className='space-y-6'>
                
                {/* Session Title */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Session Title *
                  </label>
                  <input
                    type='text'
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., Python Basics Session'
                    required
                  />
                </div>

                {/* Session Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Session Description
                  </label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Describe what you want to learn or discuss...'
                  />
                </div>

                {/* Date and Time Selection */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select Date *
                    </label>
                    <input
                      type='date'
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select Time *
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    >
                      <option value=''>Choose time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration and Type */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      {durationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Session Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='online'>Online (Video Call)</option>
                      <option value='in-person'>In-Person</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Any specific topics or requirements...'
                  />
                </div>

                {/* Price Summary */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='font-medium text-gray-900 mb-2'>Price Summary</h3>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      {duration} minutes × ৳{teacherData.hourlyRate || 0}/hour
                    </span>
                    <span className='text-xl font-bold text-gray-900'>
                      ৳{calculateTotalPrice().toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    Payment Method *
                  </label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* bKash Option */}
                    <div
                      onClick={() => setPaymentMethod('bkash')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                            paymentMethod === 'bkash' ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {paymentMethod === 'bkash' ? (
                              <img src={assets.bkash} alt='bKash' className='w-full h-full object-contain p-1' />
                            ) : (
                              <span className='text-2xl font-bold text-white'>b</span>
                            )}
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>bKash</h4>
                            <p className='text-sm text-gray-600'>Mobile Banking</p>
                          </div>
                        </div>
                        {paymentMethod === 'bkash' && (
                          <svg className='w-6 h-6 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Card Option */}
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            paymentMethod === 'card' ? 'bg-blue-500' : 'bg-gray-200'
                          }`}>
                            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                            </svg>
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>Debit/Credit Card</h4>
                            <p className='text-sm text-gray-600'>Visa, Mastercard</p>
                          </div>
                        </div>
                        {paymentMethod === 'card' && (
                          <svg className='w-6 h-6 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? 'Booking Session...' : 'Book Session'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Discord Join Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowDiscordModal(false)
                navigate(`/product/${productId}`)
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-1.25a13.028 13.028 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Booked Successfully! 🎉</h2>
              <p className="text-gray-600 mb-6">Join our Discord server to connect with your teacher and attend classes</p>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">Discord Server Link:</p>
                <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-2 border border-indigo-300">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-1.25a13.028 13.028 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <p className="text-sm font-mono text-indigo-900 break-all">{discordLink}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-1.25a13.028 13.028 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Join Discord
                </a>
                <button
                  onClick={() => {
                    setShowDiscordModal(false)
                    navigate(`/product/${productId}`)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">This window will close automatically in 10 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookSession

