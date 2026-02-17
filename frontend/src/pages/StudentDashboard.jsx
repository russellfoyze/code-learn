import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/shopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { token, backendURL } = useContext(ShopContext);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Student';
  const userEmail = localStorage.getItem('userEmail') || '';
  const [profileImageUrl, setProfileImageUrl] = useState(localStorage.getItem('profileImageUrl') || '');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  const [ratingDraft, setRatingDraft] = useState({}); // orderId -> 1..5
  const [submittingRating, setSubmittingRating] = useState({}); // orderId -> bool
  const [ratingSubmitted, setRatingSubmitted] = useState({}); // orderId -> bool
  const [myRatings, setMyRatings] = useState({}); // teacherId -> rating (1..5)

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [token, userId, navigate]);

  const fetchOrders = async () => {
    if (!backendURL || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendURL}/api/sessions/student`,
        { headers: { token } }
      );
      if (response.data.success) {
        const sessions = response.data.sessions || [];
        setOrders(sessions);
        const stats = {
          total: sessions.length,
          pending: sessions.filter(s => s.status === 'pending').length,
          confirmed: sessions.filter(s => s.status === 'confirmed').length,
          completed: sessions.filter(s => s.status === 'completed').length
        };
        setStats(stats);
        // After loading orders, fetch my ratings per distinct teacher
        const distinctTeacherIds = Array.from(new Set(
          sessions.map(s => (s.teacherId?._id || s.teacherId)).filter(Boolean)
        ));
        if (distinctTeacherIds.length > 0) {
          const ratingsMap = {};
          await Promise.all(distinctTeacherIds.map(async (tid) => {
            try {
              const r = await axios.get(`${backendURL}/api/user/teacher/${tid}/my-rating`, { headers: { token } });
              if (r.data?.success) {
                ratingsMap[tid] = Number(r.data.rating || 0);
              }
            } catch (_) {}
          }));
          setMyRatings(ratingsMap);
        }
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const completeOrder = async (orderId) => {
    if (!backendURL || !token) return;
    try {
      const response = await axios.put(
        `${backendURL}/api/sessions/${orderId}/complete`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Order marked as completed!');
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(error.response?.data?.message || 'Failed to complete order');
    }
  };

  const setStar = (orderId, value) => {
    setRatingDraft(prev => ({ ...prev, [orderId]: value }));
  };

  const submitRating = async (order) => {
    const value = ratingDraft[order._id];
    if (!value || value < 1 || value > 5) {
      toast.error('Please select a rating (1-5)');
      return;
    }
    const teacherId = order.teacherId?._id || order.teacherId;
    if (!teacherId) {
      toast.error('Teacher not found for this order');
      return;
    }
    try {
      setSubmittingRating(prev => ({ ...prev, [order._id]: true }));
      const res = await axios.post(
        `${backendURL}/api/user/teacher/${teacherId}/rate`,
        { rating: value },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Thanks for your rating!');
        setRatingDraft(prev => ({ ...prev, [order._id]: undefined }));
        setRatingSubmitted(prev => ({ ...prev, [order._id]: true }));
      } else {
        toast.error(res.data.message || 'Failed to submit rating');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(prev => ({ ...prev, [order._id]: false }));
    }
  };

  const renderStarInputs = (order) => {
    const teacherKey = order.teacherId?._id || order.teacherId;
    const myExisting = teacherKey ? myRatings[teacherKey] : 0;
    if (myExisting && myExisting > 0) {
      return (
        <span className="text-sm text-gray-700">Your rating: {myExisting}/5</span>
      );
    }
    if (ratingSubmitted[order._id]) {
      return <span className="text-sm text-gray-600">Thank you for your review!</span>;
    }
    const current = ratingDraft[order._id] || 0;
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setStar(order._id, n)}
            className={`text-xl ${current >= n ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
        <button
          onClick={() => submitRating(order)}
          disabled={submittingRating[order._id]}
          className="ml-3 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {submittingRating[order._id] ? 'Submitting...' : 'Rate'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{userName[0]?.toUpperCase() || 'S'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{userName}</h1>
              <p className="text-gray-600 truncate">{userEmail}</p>
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:shadow-md active:scale-[0.99] transition-all">
                <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13v7h7l8.485-8.485a2.5 2.5 0 10-3.536-3.536L7.464 16.464 4 13z" /></svg>
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const form = new FormData();
                      form.append('image', file);
                      const res = await axios.post(`${backendURL}/api/user/me/profile-image`, form, {
                        headers: { token, 'Content-Type': 'multipart/form-data' }
                      });
                      if (res.data?.success && res.data.profileImageUrl) {
                        setProfileImageUrl(res.data.profileImageUrl);
                        localStorage.setItem('profileImageUrl', res.data.profileImageUrl);
                        toast.success('Profile photo updated');
                      } else {
                        toast.error(res.data?.message || 'Failed to upload');
                      }
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Upload failed');
                    } finally {
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link 
                to="/collection" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse Teachers →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {(() => {
                              let imageUrl = null;
                              if (order.teacherId?.image) {
                                if (Array.isArray(order.teacherId.image) && order.teacherId.image.length > 0) {
                                  imageUrl = order.teacherId.image[0];
                                } else if (typeof order.teacherId.image === 'string') {
                                  imageUrl = order.teacherId.image;
                                }
                              }
                              return imageUrl ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={imageUrl} 
                                  alt={order.teacherName || 'Teacher'}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {order.teacherName?.[0]?.toUpperCase() || 'T'}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.teacherName}
                            </div>
                            {order.teacherId?.professionalTitle && (
                              <div className="text-sm text-gray-500">
                                {order.teacherId.professionalTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.title}</div>
                        {order.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {order.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{order.duration} min</span>
                          <span>•</span>
                          <span className={order.type === 'online' ? 'text-blue-600' : 'text-gray-600'}>
                            {order.type === 'online' ? '🌐 Online' : '🏢 In-Person'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.scheduledDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                        {order.paymentStatus && (
                          <div className="mt-1 text-xs text-gray-500">
                            Payment: {order.paymentStatus}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.totalPrice?.toFixed(2) || order.hourlyRate?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(order.status === 'confirmed' || order.status === 'pending') && (
                          <button
                            onClick={() => completeOrder(order._id)}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                          >
                            Complete Order
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="flex flex-col gap-2">
                            <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                            {renderStarInputs(order)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

