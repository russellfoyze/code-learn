import express from 'express';
import { getOrCreateChat, sendMessage, getMessages, getUserConversations, getAllChats, getChat, getTeacherChats } from '../controllers/chatController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// User routes
router.post('/get-or-create', getOrCreateChat);
router.post('/send', sendMessage);
router.post('/messages', getMessages);
router.post('/conversations', getUserConversations);
router.post('/teacher/chats', getTeacherChats); // Get chats for a teacher

// Admin routes (protected with adminAuth)
router.post('/admin/all', adminAuth, getAllChats);
router.post('/admin/chat', adminAuth, getChat);
router.post('/admin/send', adminAuth, sendMessage);

export default router;

