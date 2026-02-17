import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import { toast } from 'react-toastify';

const TeacherRequests = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const fetchRequests = async () => {
    if (!token) {
      console.error('No token found');
      setFetching(false);
      return;
    }
    setFetching(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/teacher-request/admin/all`,
        {},
        {
          headers: { token }
        }
      );
      
      if (response.data.success) {
        setRequests(response.data.requests || []);
        console.log('Fetched requests:', response.data.requests?.length || 0);
      } else {
        console.error('Failed to fetch requests:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/teacher-request/admin/approve`,
        { requestId, adminNotes },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success('Request approved and teacher added successfully!');
        setSelectedRequest(null);
        setAdminNotes('');
        fetchRequests();
      } else {
        toast.error(response.data.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/teacher-request/admin/update-status`,
        { requestId, status: 'rejected', adminNotes },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success('Request rejected');
        setSelectedRequest(null);
        setAdminNotes('');
        fetchRequests();
      } else {
        toast.error(response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Teacher Course Requests</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">All Requests</h3>
              <p className="text-sm text-gray-600 mt-1">
                {requests.filter(r => r.status === 'pending').length} pending requests
              </p>
            </div>
                  <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {fetching ? (
                      <div className="p-8 text-center text-gray-500">
                        <p>Loading requests...</p>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p>No requests found</p>
                        <button
                          onClick={fetchRequests}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedRequest?._id === request._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{request.fullName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {request.status?.toUpperCase()}
                      </span>
                    </div>
                    {request.professionalTitle && (
                      <p className="text-sm text-gray-600 mb-1">{request.professionalTitle}</p>
                    )}
                    {request.shortDescription && (
                      <p className="text-xs text-gray-500 mb-1 line-clamp-2">{request.shortDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {request.category}
                        </span>
                      )}
                      {request.hourlyRate && (
                        <span className="text-xs text-gray-600">${request.hourlyRate}/hr</span>
                      )}
                    </div>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="text-gray-600"><span className="font-medium">Teacher ID:</span> {request.teacherId}</p>
                      <p className="text-gray-600"><span className="font-medium">Teacher:</span> {request.teacherName} ({request.teacherEmail})</p>
                      <p className="text-gray-500 mt-1">
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Request Details</h3>
              
              <div className="space-y-4 mb-6">
                {/* Teacher Information */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">TEACHER INFORMATION</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Teacher ID:</span> {selectedRequest.teacherId}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Teacher Name:</span> {selectedRequest.teacherName}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Teacher Email:</span> {selectedRequest.teacherEmail}</p>
                </div>

                {(selectedRequest.image?.[0] || selectedRequest.profileImageUrl) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Profile Image</p>
                    <img 
                      src={selectedRequest.image?.[0] || selectedRequest.profileImageUrl} 
                      alt={selectedRequest.fullName}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
                  <p className="text-gray-800 font-medium">{selectedRequest.fullName}</p>
                </div>

                {selectedRequest.professionalTitle && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Professional Title</p>
                    <p className="text-gray-800">{selectedRequest.professionalTitle}</p>
                  </div>
                )}

                {selectedRequest.shortDescription && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Short Description</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRequest.shortDescription}</p>
                  </div>
                )}

                {selectedRequest.category && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-gray-800">{selectedRequest.category}</p>
                  </div>
                )}

                {selectedRequest.hourlyRate && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                    <p className="text-gray-800">${selectedRequest.hourlyRate}/hr</p>
                  </div>
                )}

                {selectedRequest.yearsOfExperience && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-gray-800">{selectedRequest.yearsOfExperience}</p>
                  </div>
                )}

                {selectedRequest.specialties && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Specialties</p>
                    <p className="text-gray-800">{selectedRequest.specialties}</p>
                  </div>
                )}

                {selectedRequest.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-800">{selectedRequest.location}</p>
                  </div>
                )}

                {selectedRequest.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-800">{selectedRequest.email}</p>
                  </div>
                )}

                {selectedRequest.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-800">{selectedRequest.phone}</p>
                  </div>
                )}

                {selectedRequest.availability && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Availability</p>
                    <p className="text-gray-800">{selectedRequest.availability}</p>
                  </div>
                )}

                {selectedRequest.responseTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-gray-800">{selectedRequest.responseTime}</p>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Add notes or reason for rejection..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.adminNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-600">{selectedRequest.adminNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              <p>Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherRequests;

