import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../config'
import { toast } from 'react-toastify'

const Orders = ({ token }) => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedSession, setExpandedSession] = useState(null) // Track which session is expanded

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/sessions/all`, {
        headers: { token }
      })
      
      if (response.data.success) {
        console.log('Fetched sessions:', response.data.sessions)
        setSessions(response.data.sessions || [])
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/sessions/stats`, {
        headers: { token }
      })
      
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/sessions/${sessionId}/status`,
        { status: newStatus },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Session status updated successfully')
        fetchSessions()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating session status:', error)
      toast.error('Failed to update session status')
    }
  }

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/sessions/${sessionId}`, {
        headers: { token }
      })
      
      if (response.data.success) {
        toast.success('Session deleted successfully')
        fetchSessions()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Failed to delete session')
    }
  }

  const cancelOrder = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      // Admins can cancel orders using the status update endpoint
      const response = await axios.put(
        `${backendUrl}/api/sessions/${sessionId}/status`,
        { status: 'cancelled' },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Order cancelled successfully')
        fetchSessions()
        fetchStats() // Refresh stats after cancellation
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchStats()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSessions = filterStatus === 'all' 
    ? sessions 
    : sessions.filter(session => session.status === filterStatus)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleExpand = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>📅</div>
          <h2 className='text-2xl font-bold text-gray-600 mb-2'>Loading Sessions...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Session Bookings</h1>
        <p className='text-gray-600'>Manage all session bookings and appointments</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-gray-900'>{stats.totalSessions || 0}</div>
          <div className='text-sm text-gray-600'>Total Sessions</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-yellow-600'>{stats.pendingSessions || 0}</div>
          <div className='text-sm text-gray-600'>Pending</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-blue-600'>{stats.confirmedSessions || 0}</div>
          <div className='text-sm text-gray-600'>Confirmed</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-green-600'>{stats.completedSessions || 0}</div>
          <div className='text-sm text-gray-600'>Completed</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-red-600'>{stats.cancelledSessions || 0}</div>
          <div className='text-sm text-gray-600'>Cancelled</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='text-2xl font-bold text-green-800'>৳{stats.totalRevenue || 0}</div>
          <div className='text-sm text-gray-600'>Total Revenue</div>
        </div>
      </div>

      {/* Filter */}
      <div className='mb-6'>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>All Sessions</option>
          <option value='pending'>Pending</option>
          <option value='confirmed'>Confirmed</option>
          <option value='completed'>Completed</option>
          <option value='cancelled'>Cancelled</option>
          <option value='no-show'>No Show</option>
        </select>
      </div>

      {/* Sessions List */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {filteredSessions.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>📅</div>
            <h3 className='text-xl font-medium text-gray-600 mb-2'>No Sessions Found</h3>
            <p className='text-gray-500'>No sessions match the current filter.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Session Details
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Teacher
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Student
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Date & Time
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Duration
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Payment Method
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
            </tr>
          </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredSessions.map((session) => (
                  <React.Fragment key={session._id}>
                    <tr className='hover:bg-gray-50 cursor-pointer' onClick={() => toggleExpand(session._id)}>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedSession === session._id ? 'rotate-90' : ''}`}
                            fill='none' 
                            stroke='currentColor' 
                            viewBox='0 0 24 24'
                          >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                          </svg>
                          <div className='flex-1'>
                            <div className='text-sm font-medium text-gray-900'>{session.title}</div>
                            {session.description && (
                              <div className='text-sm text-gray-500 truncate max-w-xs'>
                                {session.description}
                              </div>
                            )}
                            <div className='text-xs text-gray-400 mt-1'>
                              {session.type === 'online' ? '🌐 Online' : '🏢 In-Person'}
                            </div>
                          </div>
                        </div>
                      </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          {(() => {
                            // Same logic as product page - get first image from array or use string
                            let imageUrl = null;
                            if (session.teacherId?.image) {
                              if (Array.isArray(session.teacherId.image) && session.teacherId.image.length > 0) {
                                imageUrl = session.teacherId.image[0];
                              } else if (typeof session.teacherId.image === 'string') {
                                imageUrl = session.teacherId.image;
                              }
                            }
                            
                            return imageUrl ? (
                              <img
                                className='h-10 w-10 rounded-full object-cover'
                                src={imageUrl}
                                alt={session.teacherName || 'Teacher'}
                              />
                            ) : (
                              <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                                👨‍🏫
                              </div>
                            );
                          })()}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{session.teacherName}</div>
                          <div className='text-sm text-gray-500'>{session.teacherEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{session.studentName || 'N/A'}</div>
                        <div className='text-sm text-gray-500'>{session.studentEmail || 'N/A'}</div>
                        <div className='text-xs text-gray-700 mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block'>
                          Student ID: {session.studentId?._id || session.studentId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatDate(session.scheduledDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {session.duration} min
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ৳{session.totalPrice || session.price || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div>
                        {session.paymentMethod ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.paymentMethod === 'bkash' 
                              ? 'bg-green-100 text-green-800'
                              : session.paymentMethod === 'card'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.paymentMethod === 'bkash' ? 'bKash' : session.paymentMethod === 'card' ? 'Card' : session.paymentMethod}
                          </span>
                        ) : (
                          <span className='text-gray-400 text-xs'>Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium' onClick={(e) => e.stopPropagation()}>
                      <div className='flex flex-wrap gap-2'>
                        {session.status === 'pending' && (
                          <button
                            onClick={() => updateSessionStatus(session._id, 'confirmed')}
                            className='px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                          >
                            Confirm
                          </button>
                        )}
                        {session.status === 'confirmed' && (
                          <button
                            onClick={() => updateSessionStatus(session._id, 'completed')}
                            className='px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
                          >
                            Complete
                          </button>
                        )}
                        {/* Cancel button - only show if order is not cancelled or completed */}
                        {session.status !== 'cancelled' && session.status !== 'completed' && (
                          <button
                            onClick={() => cancelOrder(session._id)}
                            className='px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1'
                          >
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                            Cancel
                          </button>
                        )}
                        {session.status === 'cancelled' && (
                          <span className='px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded'>
                            Cancelled
                          </span>
                        )}
                        <button
                          onClick={() => deleteSession(session._id)}
                          className='px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details Row */}
                  {expandedSession === session._id && (
                    <tr>
                      <td colSpan={9} className='px-6 py-4 bg-gray-50'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                          {/* Session Information */}
                          <div className='bg-white p-4 rounded-lg border border-gray-200'>
                            <h4 className='font-semibold text-gray-900 mb-3'>Session Information</h4>
                            <div className='space-y-2 text-sm'>
                              <div>
                                <span className='text-gray-600'>Title:</span>
                                <span className='ml-2 text-gray-900'>{session.title}</span>
                              </div>
                              {session.description && (
                                <div>
                                  <span className='text-gray-600'>Description:</span>
                                  <p className='ml-2 text-gray-900 mt-1 whitespace-pre-wrap'>{session.description}</p>
                                </div>
                              )}
                              {session.specialRequests && (
                                <div>
                                  <span className='text-gray-600'>Special Requests:</span>
                                  <p className='ml-2 text-gray-900 mt-1 whitespace-pre-wrap'>{session.specialRequests}</p>
                                </div>
                              )}
                              <div>
                                <span className='text-gray-600'>Type:</span>
                                <span className='ml-2 text-gray-900'>{session.type === 'online' ? '🌐 Online' : '🏢 In-Person'}</span>
                              </div>
                              {session.location && (
                                <div>
                                  <span className='text-gray-600'>Location:</span>
                                  <span className='ml-2 text-gray-900'>{session.location}</span>
                                </div>
                              )}
                              {session.meetingLink && (
                                <div>
                                  <span className='text-gray-600'>Meeting Link:</span>
                                  <a href={session.meetingLink} target='_blank' rel='noopener noreferrer' className='ml-2 text-blue-600 hover:underline break-all'>
                                    {session.meetingLink}
                                  </a>
                                </div>
                              )}
                              {session.notes && (
                                <div>
                                  <span className='text-gray-600'>Notes:</span>
                                  <p className='ml-2 text-gray-900 mt-1 whitespace-pre-wrap'>{session.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Student Information */}
                          <div className='bg-white p-4 rounded-lg border border-gray-200'>
                            <h4 className='font-semibold text-gray-900 mb-3'>Student Information</h4>
                            <div className='space-y-2 text-sm'>
                              <div>
                                <span className='text-gray-600'>Name:</span>
                                <span className='ml-2 text-gray-900'>{session.studentName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Email:</span>
                                <span className='ml-2 text-gray-900'>{session.studentEmail || 'N/A'}</span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Student ID:</span>
                                <span className='ml-2 text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block'>
                                  {session.studentId?._id || session.studentId || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Payment */}
                          <div className='bg-white p-4 rounded-lg border border-gray-200'>
                            <h4 className='font-semibold text-gray-900 mb-3'>Pricing & Payment</h4>
                            <div className='space-y-2 text-sm'>
                              <div>
                                <span className='text-gray-600'>Hourly Rate:</span>
                                <span className='ml-2 text-gray-900'>৳{session.hourlyRate || 0}/hr</span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Duration:</span>
                                <span className='ml-2 text-gray-900'>{session.duration} minutes</span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Total Price:</span>
                                <span className='ml-2 text-gray-900 font-semibold'>৳{session.totalPrice || session.price || 0}</span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Payment Method:</span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full inline-block ${
                                  session.paymentMethod === 'bkash' ? 'bg-green-100 text-green-800' :
                                  session.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {session.paymentMethod ? (session.paymentMethod === 'bkash' ? 'bKash' : session.paymentMethod === 'card' ? 'Card' : session.paymentMethod) : 'Not specified'}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Payment Status:</span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full inline-block ${
                                  session.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                  session.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {session.paymentStatus || 'pending'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Timestamps & Status */}
                          <div className='bg-white p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3'>
                            <h4 className='font-semibold text-gray-900 mb-3'>Timestamps & Status</h4>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                              <div>
                                <span className='text-gray-600 block mb-1'>Booked At:</span>
                                <span className='text-gray-900'>{formatDateTime(session.bookedAt || session.createdAt)}</span>
                              </div>
                              {session.confirmedAt && (
                                <div>
                                  <span className='text-gray-600 block mb-1'>Confirmed At:</span>
                                  <span className='text-gray-900'>{formatDateTime(session.confirmedAt)}</span>
                                </div>
                              )}
                              {session.completedAt && (
                                <div>
                                  <span className='text-gray-600 block mb-1'>Completed At:</span>
                                  <span className='text-gray-900'>{formatDateTime(session.completedAt)}</span>
                                </div>
                              )}
                              <div>
                                <span className='text-gray-600 block mb-1'>Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                                  {session.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
        )}
      </div>
    </div>
  )
}

export default Orders;
