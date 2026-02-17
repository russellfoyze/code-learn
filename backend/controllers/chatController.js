import chatModel from "../models/chatModel.js";

// Get or create a chat for a user (support or with teacher)
const getOrCreateChat = async (req, res) => {
  try {
    const { userId, userName, teacherId, teacherName, teacherImage } = req.body;
    
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const chatType = teacherId ? 'teacher' : 'support';
    const query = teacherId 
      ? { userId, teacherId, chatType: 'teacher' }
      : { userId, chatType: 'support' };

    let chat = await chatModel.findOne(query);
    
    if (!chat) {
      chat = new chatModel({
        userId,
        userName: userName || "User",
        teacherId: teacherId || null,
        teacherName: teacherName || null,
        teacherImage: teacherImage || null,
        chatType,
        messages: [],
        unreadCount: 0
      });
      await chat.save();
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { userId, message, senderType = 'user', teacherId } = req.body;
    
    if (!userId || !message) {
      return res.json({ success: false, message: "User ID and message are required" });
    }

    const chatType = teacherId ? 'teacher' : 'support';
    const query = teacherId 
      ? { userId, teacherId, chatType: 'teacher' }
      : { userId, chatType: 'support' };

    let chat = await chatModel.findOne(query);
    
    if (!chat) {
      chat = new chatModel({
        userId,
        userName: req.body.userName || "User",
        teacherId: teacherId || null,
        teacherName: req.body.teacherName || null,
        teacherImage: req.body.teacherImage || null,
        chatType,
        messages: []
      });
    }

    let receiverId;
    if (senderType === 'user') {
      receiverId = teacherId || 'admin';
    } else if (senderType === 'teacher') {
      receiverId = userId;
    } else {
      receiverId = userId;
    }

    const newMessage = {
      senderId: senderType === 'admin' ? 'admin' : (senderType === 'teacher' ? teacherId : userId),
      receiverId,
      message,
      timestamp: Date.now(),
      read: false,
      senderType
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = Date.now();
    chat.updatedAt = Date.now();
    
    // Update unread count based on receiver
    if (senderType === 'user') {
      if (chatType === 'support') {
        // Message sent by user to support, admin should see unread count
        chat.unreadCount = chat.messages.filter(msg => 
          msg.receiverId === 'admin' && !msg.read
        ).length;
      } else {
        // Message sent by user, teacher should see unread count
        chat.unreadCount = chat.messages.filter(msg => 
          msg.receiverId === teacherId && !msg.read
        ).length;
      }
    } else if (senderType === 'teacher') {
      // Message sent by teacher, user should see unread count
      chat.unreadCount = chat.messages.filter(msg => 
        msg.receiverId === userId && !msg.read
      ).length;
    } else if (senderType === 'admin') {
      // Admin message sent, user should see unread count
      chat.unreadCount = chat.messages.filter(msg => 
        msg.receiverId === userId && !msg.read
      ).length;
    }

    await chat.save();

    res.json({ success: true, message: newMessage, chat });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { userId, teacherId } = req.body;
    
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const chatType = teacherId ? 'teacher' : 'support';
    // Use exact userId and teacherId combination to fetch the same chat
    // This ensures both student and teacher views show the same conversation
    const query = teacherId 
      ? { userId, teacherId, chatType: 'teacher' }
      : { userId, chatType: 'support' };

    const chat = await chatModel.findOne(query);
    
    if (!chat) {
      return res.json({ success: true, messages: [], chat: null });
    }

    // Mark messages as read when viewed by the receiver
    if (req.body.markAsRead) {
      const currentUserId = req.body.currentUserId || userId;
      let hasUnread = false;
      
      chat.messages.forEach(msg => {
        // Mark as read if the current user is the receiver
        if (msg.receiverId === currentUserId && !msg.read) {
          msg.read = true;
        }
        // Check if there are still unread messages for the current user
        if (msg.receiverId === currentUserId && !msg.read) {
          hasUnread = true;
        }
      });
      
      // Update unread count based on receiver perspective
      if (chatType === 'teacher' && teacherId) {
        // For teacher chats, unreadCount is for the teacher
        chat.unreadCount = chat.messages.filter(msg => 
          msg.receiverId === teacherId && !msg.read
        ).length;
      } else {
        // For user, count unread messages
        chat.unreadCount = chat.messages.filter(msg => 
          msg.receiverId === userId && !msg.read
        ).length;
      }
      
      await chat.save();
    }

    // Return ALL messages in the chat from database - both from student and teacher
    // This ensures students can see all teacher messages and vice versa
    // Include complete chat object with all message history
    const allMessages = chat.messages || [];
    console.log(`Fetched ${allMessages.length} messages for chat with userId: ${userId}, teacherId: ${teacherId || 'support'}`);
    
    res.json({ 
      success: true, 
      messages: allMessages, 
      chat: {
        ...chat.toObject(),
        messages: allMessages // Include all messages in chat object for frontend
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const conversations = await chatModel.find({ userId }).sort({ updatedAt: -1 });
    
    res.json({ success: true, conversations });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all chats (for admin) - only support chats
const getAllChats = async (req, res) => {
  try {
    // Filter only support chats for admin panel
    const chats = await chatModel.find({ chatType: 'support' }).sort({ updatedAt: -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get a specific chat (for admin) - only support chats
const getChat = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    // Admin only handles support chats
    const chat = await chatModel.findOne({ userId, chatType: 'support' });
    
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // Mark messages as read when admin views them
    chat.messages.forEach(msg => {
      if (msg.receiverId === 'admin' && !msg.read) {
        msg.read = true;
      }
    });
    
    // Update unread count for admin (messages sent by user that admin hasn't read)
    chat.unreadCount = chat.messages.filter(msg => 
      msg.senderType === 'user' && msg.receiverId === 'admin' && !msg.read
    ).length;
    
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get chats for a specific teacher
const getTeacherChats = async (req, res) => {
  try {
    const { teacherId } = req.body;
    
    if (!teacherId) {
      return res.json({ success: false, message: "Teacher ID is required" });
    }

    const chats = await chatModel.find({ teacherId, chatType: 'teacher' }).sort({ updatedAt: -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getOrCreateChat, sendMessage, getMessages, getUserConversations, getAllChats, getChat, getTeacherChats };
