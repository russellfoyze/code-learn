import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import { toast } from 'react-toastify';

const Chat = ({ token }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchAllChats();

    // Poll for updates every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchAllChats();
      if (selectedChat) {
        fetchChatMessages(selectedChat.userId);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAllChats = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/chat/admin/all`, {}, {
        headers: { token }
      });

      if (response.data.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChatMessages = async (userId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/chat/admin/chat`, {
        userId,
        markAsRead: true
      }, {
        headers: { token }
      });

      if (response.data.success) {
        setMessages(response.data.chat?.messages || []);
        // Update chat in list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.userId === userId ? response.data.chat : chat
          )
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.userId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/chat/admin/send`, {
        userId: selectedChat.userId,
        message: newMessage,
        senderType: 'admin'
      }, {
        headers: { token }
      });

      if (response.data.success) {
        setNewMessage('');
        setMessages(response.data.chat?.messages || []);
        fetchAllChats(); // Refresh chat list
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
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold">Support Chats</h2>
          <p className="text-sm text-gray-500">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="divide-y">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No support chats yet</p>
              <p className="text-xs mt-2">Users can contact support from the frontend chat page</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.userId === chat.userId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{chat.userName || `User ${chat.userId.slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 mb-1">
                        {chat.unreadCount}
                      </span>
                    )}
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-400">
                        {formatDate(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <h3 className="font-semibold">{selectedChat.userName || `User ${selectedChat.userId.slice(0, 8)}`}</h3>
              <p className="text-sm text-gray-500">User ID: {selectedChat.userId}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderType === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Select a support chat</p>
              <p className="text-sm">Choose a conversation from the list to respond to user inquiries</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

