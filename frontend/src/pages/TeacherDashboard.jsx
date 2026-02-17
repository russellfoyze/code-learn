import React, { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/shopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const TeacherDashboard = () => {
  const { token, backendURL, products, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize tab based on URL hash
  const getInitialTab = () => {
    if (location.hash === '#chats') return 'chats';
    if (location.hash === '#request') return 'request';
    if (location.state?.openChats) return 'chats';
    return 'courses';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [myRequests, setMyRequests] = useState([]);
  const [orders, setOrders] = useState([]); // Sessions/Orders for teacher
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const teacherId = localStorage.getItem('userId');
  const pollIntervalRef = useRef(null);

  // Course Request form states (simplified)
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState(""); // Programming language category
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Programming languages list
  const programmingLanguages = [
    "Python",
    "C",
    "C++",
    "JavaScript",
    "PHP",
    "Kotlin",
    "Java",
    "Swift",
    "Go",
    "Rust",
    "Ruby",
    "TypeScript",
    "SQL",
    "HTML/CSS",
    "React",
    "Node.js",
    "Angular",
    "Vue.js",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "ASP.NET",
    "Other"
  ];

  const fetchMyRequests = async () => {
    if (!backendURL || !teacherId) return;
    try {
      const response = await axios.post(
        `${backendURL}/api/teacher-request/my-requests`,
        { teacherId },
        { headers: { token } }
      );
      if (response.data.success) {
        setMyRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const fetchOrders = async () => {
    if (!backendURL || !token) return;
    setOrdersLoading(true);
    try {
      const response = await axios.get(
        `${backendURL}/api/sessions/teacher/my-sessions`,
        { headers: { token } }
      );
      if (response.data.success) {
        const sessions = response.data.sessions || [];
        setOrders(sessions);
        
        // Calculate total earnings from paid/confirmed/completed orders
        const earnings = sessions
          .filter(order => {
            // Include orders that are confirmed or completed and not cancelled
            // And have payment status of paid (or pending if confirmed/completed)
            return (
              (order.status === 'confirmed' || order.status === 'completed') &&
              order.status !== 'cancelled' &&
              order.totalPrice
            );
          })
          .reduce((total, order) => total + (order.totalPrice || 0), 0);
        
        setTotalEarnings(earnings);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!backendURL || !token) return;
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const response = await axios.put(
        `${backendURL}/api/sessions/${orderId}/cancel`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders list
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const fetchTeacherChats = async () => {
    if (!backendURL || !teacherId || !products) return;
    try {
      // Find teacher's product ID from products context
      const teacherProduct = products.find(p => p.teacherId === teacherId);
      
      if (!teacherProduct) {
        // Teacher doesn't have an approved course yet, no chats to show
        setChats([]);
        return;
      }

      const teacherProductId = teacherProduct._id;

      const response = await axios.post(`${backendURL}/api/chat/teacher/chats`, {
        teacherId: teacherProductId
      });
      
      if (response.data.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChatMessages = async () => {
    if (!selectedChat || !backendURL || !products) return;

    try {
      // Use the exact userId and teacherId from selectedChat to fetch the same chat
      // This ensures teacher and student see the same conversation data from the database
      const chatUserId = selectedChat.userId;
      const chatTeacherId = selectedChat.teacherId;
      
      // Find teacher's product ID for read receipt tracking
      const teacherProduct = products.find(p => p.teacherId === teacherId);
      const currentUserId = teacherProduct?._id || chatTeacherId;
      
      const response = await axios.post(`${backendURL}/api/chat/messages`, {
        userId: chatUserId,
        teacherId: chatTeacherId,
        markAsRead: true,
        currentUserId: currentUserId // Pass teacher's product ID for read receipt tracking
      });

      if (response.data.success) {
        // Get all messages from the response - both from student and teacher
        let allMessages = response.data.messages || [];
        
        // If chat object exists and has messages, merge them
        if (response.data.chat && response.data.chat.messages && response.data.chat.messages.length > 0) {
          const chatMessages = response.data.chat.messages;
          const messageMap = new Map();
          
          // Add all messages from chat object
          chatMessages.forEach(msg => {
            const key = `${msg.timestamp}_${msg.senderId}_${msg.message}`;
            if (!messageMap.has(key)) {
              messageMap.set(key, msg);
            }
          });
          
          // Add all messages from messages array
          allMessages.forEach(msg => {
            const key = `${msg.timestamp}_${msg.senderId}_${msg.message}`;
            if (!messageMap.has(key)) {
              messageMap.set(key, msg);
            }
          });
          
          allMessages = Array.from(messageMap.values());
        }
        
        // Filter out duplicates
        const uniqueMessages = allMessages.filter((msg, index, self) => {
          return index === self.findIndex((m) => 
            m._id === msg._id || (
              m.timestamp === msg.timestamp && 
              m.message === msg.message && 
              m.senderId === msg.senderId &&
              m.senderType === msg.senderType
            )
          );
        });
        
        // Sort messages by timestamp to ensure chronological order (oldest to newest)
        const sortedMessages = uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        // Always update messages to show all chat data from database
        // This ensures complete conversation history is displayed with all student and teacher messages
        console.log(`Teacher: Loaded ${sortedMessages.length} messages from database for chat`);
        setMessages(sortedMessages);
        
        // Update selected chat to ensure it has the latest data
        if (response.data.chat) {
          setSelectedChat({
            ...response.data.chat,
            messages: sortedMessages
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (!token || !teacherId) {
      navigate('/login');
      return;
    }

    // Check URL hash to determine active tab
    const hash = location.hash;
    if (hash === '#chats') {
      setActiveTab('chats');
    } else if (hash === '#request') {
      setActiveTab('request');
    } else if (!hash) {
      setActiveTab('courses');
    }
  }, [location.hash, token, teacherId, navigate]);

  useEffect(() => {
    if (!token || !teacherId || !backendURL) return;

         if (activeTab === 'courses') {
           fetchMyRequests(); // Only fetch requests
         } else if (activeTab === 'orders') {
           fetchOrders();
         } else if (activeTab === 'chats' && products) {
      fetchTeacherChats();
      if (selectedChat) {
        fetchChatMessages();
      }
      
      // Poll every 2 seconds to ensure real-time sync with student chat
      pollIntervalRef.current = setInterval(() => {
        if (activeTab === 'chats' && products) {
          fetchTeacherChats(); // Refresh conversation list
          if (selectedChat) {
            fetchChatMessages(); // Refresh messages in current chat
          }
        }
      }, 2000); // Match student chat polling frequency
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedChat, token, teacherId, backendURL, products]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
    fetchChatMessages();
  };

  const startChatWithStudent = async (order) => {
    try {
      const studentUserId = order.studentId?._id || order.studentId;
      const studentName = order.studentName || 'Student';
      
      if (!studentUserId) {
        toast.error('Student ID not available');
        return;
      }

      // Find teacher's product ID from products context
      const teacherProduct = products.find(p => p.teacherId === teacherId);
      
      if (!teacherProduct) {
        toast.error('No Order found. Please ensure your course is approved.');
        return;
      }

      const teacherProductId = teacherProduct._id;

      // Create or get chat with student
      const chatResponse = await axios.post(
        `${backendURL}/api/chat/get-or-create`,
        {
          userId: studentUserId,
          userName: studentName,
          teacherId: teacherProductId,
          teacherName: teacherProduct.fullName || 'Teacher',
          teacherImage: (() => {
            // Same logic as product page - get first image from array or use string
            if (teacherProduct.image) {
              if (Array.isArray(teacherProduct.image) && teacherProduct.image.length > 0) {
                return teacherProduct.image[0];
              } else if (typeof teacherProduct.image === 'string') {
                return teacherProduct.image;
              }
            }
            return teacherProduct.profileImageUrl || null;
          })()
        }
      );

      if (chatResponse.data.success) {
        // Switch to chats tab and select the chat
        setActiveTab('chats');
        // Use the chat from response directly and add it to the list
        const newChat = chatResponse.data.chat;
        setSelectedChat(newChat);
        // Add the new chat to the chats list if it's not already there
        setChats(prevChats => {
          const exists = prevChats.some(c => c._id === newChat._id);
          if (!exists) {
            return [newChat, ...prevChats];
          }
          return prevChats;
        });
        // Refresh chats list to ensure consistency
        await fetchTeacherChats();
        // Ensure the chat is still selected after refresh finds it in the list
        fetchChatMessages();
        toast.success(`Chat opened with ${studentName}`);
      } else {
        toast.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error.response?.data?.message || 'Failed to start chat. Please try again.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);
    try {
      // Use the exact userId and teacherId from selectedChat to ensure we're saving to the same chat
      // This guarantees that student and teacher see the same conversation
      const response = await axios.post(`${backendURL}/api/chat/send`, {
        userId: selectedChat.userId,
        message: newMessage,
        senderType: 'teacher',
        teacherId: selectedChat.teacherId
      });

      if (response.data.success) {
        setNewMessage('');
        // Get all messages from chat response - includes all student and teacher messages
        const allMessages = response.data.chat?.messages || [];
        // Sort messages by timestamp to ensure chronological order
        const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);
        // Update selected chat to ensure it has the latest data from database
        setSelectedChat({
          ...response.data.chat,
          messages: sortedMessages
        });
        // Immediately refresh chats list to show updated last message
        fetchTeacherChats();
        // Immediately refresh messages to ensure we have the latest from database
        setTimeout(() => fetchChatMessages(), 500);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleCourseRequestSubmit = async (e) => {
    e.preventDefault();

    if (!backendURL) {
      toast.error("Backend URL not configured");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append("teacherId", teacherId);
      formData.append("fullName", fullName);
      formData.append("category", category);
      formData.append("yearsOfExperience", yearsOfExperience);
      formData.append("hourlyRate", hourlyRate);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("availability", availability);
      formData.append("responseTime", responseTime);
      formData.append("shortDescription", shortDescription);
      
      if (image) {
        formData.append("image1", image);
      }

      const response = await axios.post(
        `${backendURL}/api/teacher-request/submit`,
        formData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Request submitted successfully!");
        // Reset form
        setFullName("");
        setCategory("");
        setYearsOfExperience("");
        setHourlyRate("");
        setPhone("");
        setEmail("");
        setAvailability("");
        setResponseTime("");
        setShortDescription("");
        setImage(null);
        // Refresh requests list
        fetchMyRequests();
        // Switch to courses tab to see the new request
        setActiveTab('courses');
      } else {
        toast.error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage your courses and communicate with students</p>
            </div>
            {/* Total Earnings Display */}
            <div className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 shadow-md">
              <div className="text-white">
                <p className="text-sm font-medium opacity-90 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">{currency}{totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs opacity-75 mt-1">From confirmed & completed sessions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('courses'); setSelectedChat(null); }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Student Chats
              {chats.filter(c => c.unreadCount > 0).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {chats.filter(c => c.unreadCount > 0).length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setSelectedChat(null); }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Orders
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('request'); setSelectedChat(null); }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'request'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Course Request
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'courses' ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Courses</h2>
                
                {/* Course Requests Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">My Course Requests</h3>
                  {myRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      <p>No course requests submitted yet. Submit a request in the "Course Request" tab.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {myRequests.map((request) => (
                        <div key={request._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{request.fullName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                          {request.shortDescription && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.shortDescription}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {request.category && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {request.category}
                              </span>
                            )}
                            {request.hourlyRate && (
                              <span className="text-sm text-gray-700">${request.hourlyRate}/hr</span>
                            )}
                          </div>
                          {request.image?.[0] && (
                            <img 
                              src={request.image[0]} 
                              alt={request.fullName}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          {request.adminNotes && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                              <p className="font-medium">Admin Note:</p>
                              <p>{request.adminNotes}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'chats' ? (
              <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Student Conversations</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No conversations yet
                      </div>
                    ) : (
                      chats.map((chat) => (
                        <button
                          key={chat._id}
                          onClick={() => selectChat(chat)}
                          className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{chat.userName || 'Student'}</p>
                              <p className="text-xs text-gray-500 font-mono">ID: {chat.userId || 'N/A'}</p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                          {chat.lastMessageTime && (
                            <p className="text-xs text-gray-400 mt-1">{formatTime(chat.lastMessageTime)}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col bg-gray-50">
                  {selectedChat ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {selectedChat.userName?.[0]?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{selectedChat.userName || 'Student'}</h3>
                          <p className="text-xs text-gray-500 font-mono">Student ID: {selectedChat.userId || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isTeacher = msg.senderType === 'teacher';
                            const isStudent = msg.senderType === 'user';
                            const showStudentInfo = isStudent && (index === 0 || messages[index - 1].senderType !== 'user');
                            
                            return (
                              <div
                                key={index}
                                className={`flex ${isTeacher ? 'justify-end' : 'justify-start'} items-end gap-2`}
                              >
                                {!isTeacher && showStudentInfo && (
                                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-semibold">
                                      {selectedChat.userName?.[0]?.toUpperCase() || 'S'}
                                    </span>
                                  </div>
                                )}
                                <div className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                  {isStudent && showStudentInfo && (
                                    <div className="mb-0.5 px-1">
                                      <p className="text-xs font-medium text-gray-700">{selectedChat.userName || 'Student'}</p>
                                      <p className="text-xs text-gray-500 font-mono">ID: {selectedChat.userId || msg.senderId || 'N/A'}</p>
                                    </div>
                                  )}
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${
                                      isTeacher
                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 px-1 ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                                    {isTeacher && (
                                      <svg className={`w-3 h-3 ${msg.read ? 'text-blue-300' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        {msg.read ? (
                                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                        ) : (
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        )}
                                      </svg>
                                    )}
                                    <p className={`text-xs ${isTeacher ? 'text-gray-300' : 'text-gray-400'}`}>
                                      {formatMessageTime(msg.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                {isTeacher && (
                                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-semibold">T</span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="p-4 border-t border-gray-200 bg-white">
                        <form onSubmit={sendMessage} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                          />
                          <button
                            type="submit"
                            disabled={loading || !newMessage.trim()}
                            className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Select a conversation</p>
                        <p className="text-sm">Choose a student chat to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'orders' ? (
                     <div>
                       <div className="flex items-center justify-between mb-6">
                         <div>
                           <h2 className="text-xl font-semibold mb-1">Your Orders</h2>
                           <p className="text-sm text-gray-600">All session bookings from students</p>
                         </div>
                         <div className="text-right">
                           <p className="text-sm text-gray-600">Total Orders: <span className="font-semibold text-gray-900">{orders.length}</span></p>
                           <p className="text-sm text-gray-600">Pending: <span className="font-semibold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</span></p>
                         </div>
                       </div>
                       
                       {ordersLoading ? (
                         <div className="text-center py-12">
                           <div className="text-2xl mb-4">📅</div>
                           <p className="text-gray-500">Loading orders...</p>
                         </div>
                       ) : orders.length === 0 ? (
                         <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                           <div className="text-6xl mb-4">📅</div>
                           <h3 className="text-xl font-medium text-gray-600 mb-2">No Orders Found</h3>
                           <p className="text-gray-500">No session bookings yet.</p>
                         </div>
                       ) : (
                         <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                               <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Session Information
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Student Information
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Status & Price
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Actions
                                 </th>
                               </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                               {orders.map((order) => (
                                 <tr key={order._id} className="hover:bg-gray-50">
                                   <td className="px-6 py-4">
                                     <div className="text-sm font-medium text-gray-900 mb-1">{order.title}</div>
                                     {order.description && (
                                       <div className="text-sm text-gray-600 mb-1">{order.description}</div>
                                     )}
                                     {order.scheduledDate && (
                                       <div className="text-xs text-gray-500 mb-1">
                                         📅 {new Date(order.scheduledDate).toLocaleDateString('en-US', {
                                           year: 'numeric',
                                           month: 'short',
                                           day: 'numeric',
                                           hour: '2-digit',
                                           minute: '2-digit'
                                         })}
                                       </div>
                                     )}
                                     <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                       {order.duration && <span>{order.duration} min</span>}
                                       <span className={`px-2 py-0.5 rounded-full ${
                                         order.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                       }`}>
                                         {order.type === 'online' ? '🌐 Online' : '🏢 In-Person'}
                                       </span>
                                       {order.location && (
                                         <span>📍 {order.location}</span>
                                       )}
                                     </div>
                                     {order.specialRequests && (
                                       <div className="mt-2 text-xs text-gray-500">
                                         <span className="font-medium">Special Requests:</span> {order.specialRequests}
                                       </div>
                                     )}
                                     {order.meetingLink && (
                                       <div className="mt-2">
                                         <a href={order.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                           🔗 Meeting Link
                                         </a>
                                       </div>
                                     )}
                                     {order.notes && (
                                       <div className="mt-2 text-xs text-gray-500">
                                         <span className="font-medium">Notes:</span> {order.notes}
                                       </div>
                                     )}
                                   </td>
                                   <td className="px-6 py-4">
                                     <div className="flex flex-col gap-2">
                                       <div>
                                         <p className="text-sm font-semibold text-gray-900">
                                           {order.studentName || order.studentId?.name || 'Student'}
                                         </p>
                                         <p className="text-xs text-gray-500">
                                           {order.studentEmail || order.studentId?.email || 'No email'}
                                         </p>
                                       </div>
                                       <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 text-gray-700">
                                         ID: {order.studentId?._id || order.studentId || 'N/A'}
                                       </div>
                                     </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex flex-col gap-2">
                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                         order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                         order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                         order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                         order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                         'bg-gray-100 text-gray-800'
                                       }`}>
                                         {order.status?.toUpperCase() || 'PENDING'}
                                       </span>
                                       {order.totalPrice && (
                                         <div className="text-sm font-semibold text-gray-900">
                                           {currency}{order.totalPrice.toFixed(2)}
                                         </div>
                                       )}
                                       {order.hourlyRate && (
                                         <div className="text-xs text-gray-500">
                                           @ {currency}{order.hourlyRate}/hr
                                         </div>
                                       )}
                                       {order.paymentStatus && (
                                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                           order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                                           order.paymentStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                           'bg-red-50 text-red-700 border border-red-200'
                                         }`}>
                                           {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'pending' ? '⏳ Pending' : 'Refunded'}
                                         </span>
                                       )}
                                       {order.paymentMethod && (
                                         <div className="text-xs text-gray-500">
                                           💳 {order.paymentMethod}
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex flex-col gap-2">
                                       {(order.studentId?._id || order.studentId) && (
                                         <button
                                           onClick={() => startChatWithStudent(order)}
                                           className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                                         >
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                           </svg>
                                           Chat
                                         </button>
                                       )}
                                       {order.status !== 'cancelled' && order.status !== 'completed' && (
                                         <button
                                           onClick={() => cancelOrder(order._id)}
                                           className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                                         >
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                           </svg>
                                           Cancel
                                         </button>
                                       )}
                                       {order.status === 'cancelled' && (
                                         <span className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded text-center">
                                           Cancelled
                                         </span>
                                       )}
                                     </div>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       )}
                     </div>
                   ) : activeTab === 'request' ? (
              <div className="overflow-y-auto max-h-[600px]">
                <h2 className="text-xl font-semibold mb-6">Submit Course Request</h2>
                <p className="text-gray-600 mb-6">Fill out the form below to submit your course/teacher profile for admin approval.</p>
                
                <form onSubmit={handleCourseRequestSubmit} className="flex flex-col w-full items-start gap-4">
                  {/* Image Upload */}
                  <div className='w-full mb-4'>
                    <label className='block mb-2 font-medium'>Profile Image</label>
                    <div className='flex items-center gap-4'>
                      <label htmlFor='image-upload' className='cursor-pointer'>
                        <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors'>
                          {image ? (
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt="Preview" 
                              className='w-full h-full object-cover rounded-lg'
                            />
                          ) : (
                            <div className='text-center'>
                              <svg className='w-8 h-8 mx-auto text-gray-400 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                              </svg>
                              <p className='text-sm text-gray-500'>Upload Image</p>
                            </div>
                          )}
                        </div>
                        <input 
                          type="file" 
                          id="image-upload" 
                          accept="image/*" 
                          onChange={(e) => setImage(e.target.files[0])}
                          className='hidden'
                        />
                      </label>
                      {image && (
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className='px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50'
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
                    <div>
                      <label className='block mb-2 font-medium'>Name *</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g. Sarah Chen'
                        required 
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Programming Language Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      >
                        <option value="">Select a programming language</option>
                        {programmingLanguages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Years of Experience</label>
                      <input 
                        type="text" 
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g. 8 years'
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Hourly Rate</label>
                      <input 
                        type="number" 
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g. 85'
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='+1 (555) 123-4567'
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='teacher@codelearn.com'
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Availability</label>
                      <input 
                        type="text" 
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g. Mon-Fri, 9 AM - 6 PM'
                      />
                    </div>

                    <div>
                      <label className='block mb-2 font-medium'>Response Time</label>
                      <input 
                        type="text" 
                        value={responseTime}
                        onChange={(e) => setResponseTime(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g. 2 hours'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block mb-2 font-medium'>Short Description</label>
                      <textarea 
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        rows="4"
                        placeholder='Brief description of the teacher expertise...'
                      />
                    </div>
                  </div>

                  <div className='flex gap-4 w-full max-w-xs mx-auto mt-6'>
                    <button 
                      type='submit' 
                      disabled={submitting}
                      className='flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
                    >
                      {submitting ? 'Submitting...' : 'SUBMIT REQUEST'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
