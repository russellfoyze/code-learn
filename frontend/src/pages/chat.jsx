import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/shopContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const { token, backendURL, products } = useContext(ShopContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTeacherList, setShowTeacherList] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const pollIntervalRef = useRef(null);
  const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
  const profileImageUrl = localStorage.getItem('profileImageUrl') || '';

  // Auto-select chat if navigated from product page
  useEffect(() => {
    if (location.state?.teacherId && conversations.length > 0) {
      const chatWithTeacher = conversations.find(
        c => (c.teacherId === location.state.teacherId || c._id === location.state.chatId) && c.chatType === 'teacher'
      );
      if (chatWithTeacher && !selectedChat) {
        selectChat(chatWithTeacher);
      }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }

    if (backendURL) {
      fetchConversations();
      pollIntervalRef.current = setInterval(() => {
        fetchConversations();
        if (selectedChat) {
          fetchMessages();
        }
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [backendURL, selectedChat]);

  // Auto-scroll removed - users can scroll manually
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  const fetchConversations = async () => {
    try {
      const response = await axios.post(`${backendURL}/api/chat/conversations`, {
        userId
      });
      
      if (response.data.success) {
        const convs = response.data.conversations || [];
        setConversations(convs);
        // compute total unread for user
        let total = 0;
        convs.forEach(c => {
          if (Array.isArray(c.messages)) {
            total += c.messages.filter(m => m.receiverId === userId && !m.read).length;
          }
        });
        setTotalUnread(total);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await axios.post(`${backendURL}/api/chat/messages`, {
        userId,
        teacherId: selectedChat.teacherId || null,
        markAsRead: true
      });
      
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    fetchMessages();
  };

  const startTeacherChat = async (teacher) => {
    try {
      const response = await axios.post(`${backendURL}/api/chat/get-or-create`, {
        userId,
        userName: 'User',
        teacherId: teacher._id,
        teacherName: teacher.fullName,
        teacherImage: teacher.image?.[0] || teacher.profileImageUrl
      });

      if (response.data.success) {
        setSelectedChat(response.data.chat);
        setMessages(response.data.chat?.messages || []);
        setShowTeacherList(false);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/chat/send`, {
        userId,
        message: newMessage,
        senderType: 'user',
        teacherId: selectedChat.teacherId || null
      });

      if (response.data.success) {
        setNewMessage('');
        setMessages(response.data.chat?.messages || []);
        fetchConversations();
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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-lg">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              {totalUnread > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{totalUnread} unread</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly(v => !v)}
                className={`px-2 py-1 text-xs rounded-full border ${showUnreadOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                title="Show Unread"
              >
                Unread
              </button>
              <button
                onClick={() => setShowTeacherList(!showTeacherList)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                title="Message a Teacher"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Teacher List (when clicking + button) */}
        {showTeacherList && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 max-h-60 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Select a Teacher</h3>
            <div className="space-y-2">
              {products.slice(0, 10).map((teacher) => (
                <button
                  key={teacher._id}
                  onClick={() => startTeacherChat(teacher)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    {teacher.image?.[0] || teacher.profileImageUrl ? (
                      <img src={teacher.image?.[0] || teacher.profileImageUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">👨‍🏫</div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-800">{teacher.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{teacher.professionalTitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {/* Support Chat */}
          <button
            onClick={async () => {
              try {
                // Get or create support chat
                const response = await axios.post(`${backendURL}/api/chat/get-or-create`, {
                  userId,
                  userName: localStorage.getItem('userName') || 'User'
                });

                if (response.data.success) {
                  const supportChat = response.data.chat;
                  // Respect unread filter when selecting
                  selectChat(supportChat);
                  fetchConversations(); // Refresh conversations list
                }
              } catch (error) {
                console.error('Error creating support chat:', error);
                toast.error('Failed to open support chat');
              }
            }}
            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              selectedChat?.chatType === 'support' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Support</p>
                {(() => {
                  const s = conversations.find(c => c.chatType === 'support');
                  const unread = s?.messages?.filter(m => m.receiverId === userId && !m.read).length || 0;
                  if (showUnreadOnly && unread === 0) return null;
                  return unread > 0 ? (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>
                  ) : null;
                })()}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {conversations.find(c => c.chatType === 'support')?.lastMessage || 'Get help from our support team'}
              </p>
            </div>
          </button>

          {/* Teacher Conversations */}
          {conversations
            .filter(c => c.chatType === 'teacher')
            .filter(c => {
              if (!showUnreadOnly) return true;
              const unread = c?.messages?.filter(m => m.receiverId === userId && !m.read).length || 0;
              return unread > 0;
            })
            .map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => selectChat(conversation)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat?._id === conversation._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  {conversation.teacherImage ? (
                    <img src={conversation.teacherImage} alt={conversation.teacherName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👨‍🏫</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{conversation.teacherName || 'Teacher'}</p>
                    {(() => {
                      const unread = conversation.messages?.filter(m => m.receiverId === userId && !m.read).length || 0;
                      return unread > 0 ? (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  {conversation.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(conversation.lastMessageTime)}</p>
                  )}
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                {selectedChat.chatType === 'teacher' && selectedChat.teacherImage ? (
                  <img src={selectedChat.teacherImage} alt={selectedChat.teacherName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {selectedChat.chatType === 'teacher' 
                    ? selectedChat.teacherName || 'Teacher'
                    : 'Support Team'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedChat.chatType === 'teacher' 
                    ? 'Active now' 
                    : 'Usually replies within minutes'}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4 старије.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.senderType === 'user';
                  const showAvatar = index === 0 || messages[index - 1].senderType !== msg.senderType;
                  const showTime = index === messages.length - 1 || 
                    new Date(messages[index + 1].timestamp) - new Date(msg.timestamp) > 300000; // 5 minutes
                  
                  return (
                    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {!isUser && showAvatar && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                          {selectedChat.chatType === 'teacher' && selectedChat.teacherImage ? (
                            <img src={selectedChat.teacherImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">S</div>
                          )}
                        </div>
                      )}
                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isUser
                              ? 'bg-blue-500 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        {showTime && (
                          <p className={`text-xs text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                      {isUser && showAvatar && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center flex-shrink-0">
                          {profileImageUrl ? (
                            <img src={profileImageUrl} alt="Me" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-semibold">U</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
          </div>

          {/* Input Area */}
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium mb-2">Select a conversation to start messaging</p>
              <p className="text-sm">Choose Support or message a teacher</p>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
