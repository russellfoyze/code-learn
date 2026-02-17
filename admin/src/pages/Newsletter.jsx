import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Newsletter = ({ token }) => {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchSubscribers = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/newsletter/subscribers`, {
        headers: { token }
      })
      
      if (response.data.success) {
        setSubscribers(response.data.subscribers || [])
        setTotal(response.data.total || 0)
      } else {
        toast.error(response.data.message || 'Failed to fetch subscribers')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [token])

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Newsletter Subscribers</h1>
          <p className="text-gray-600">Manage and view all newsletter email subscriptions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600">Total Subscribers</p>
            <p className="text-2xl font-bold text-blue-600">{total}</p>
          </div>
          <button
            onClick={fetchSubscribers}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-4">📬</div>
          <p className="text-gray-500">Loading subscribers...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Subscribers Yet</h3>
          <p className="text-gray-500">Newsletter subscriptions will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber, index) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Newsletter
