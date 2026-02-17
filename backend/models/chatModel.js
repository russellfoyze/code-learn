import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: String, required: true}, // userId, teacherId, or 'admin'
    receiverId: {type: String, required: true}, // userId, teacherId, or 'admin'
    message: {type: String, required: true},
    timestamp: {type: Number, required: true, default: Date.now},
    read: {type: Boolean, default: false},
    senderType: {type: String, enum: ['user', 'admin', 'teacher'], required: true}
})

const chatSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    userName: {type: String, required: false},
    teacherId: {type: String, required: false}, // If chatting with a specific teacher
    teacherName: {type: String, required: false},
    teacherImage: {type: String, required: false},
    chatType: {type: String, enum: ['support', 'teacher'], default: 'support'}, // support = admin chat, teacher = teacher chat
    messages: [messageSchema],
    lastMessage: {type: String, required: false},
    lastMessageTime: {type: Number, required: false},
    unreadCount: {type: Number, default: 0},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
})

// Create compound index to ensure uniqueness of userId-teacherId pairs for teacher chats
// This ensures the same chat is always returned for the same student-teacher pair
chatSchema.index({ userId: 1, teacherId: 1, chatType: 1 }, { 
    unique: true, 
    partialFilterExpression: { chatType: 'teacher', teacherId: { $exists: true, $ne: null } }
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema)
const messageModel = mongoose.models.message || mongoose.model("message", messageSchema)

export default chatModel;
