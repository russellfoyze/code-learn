import express from 'express';
import {
  bookSession,
  getAllSessions,
  getStudentSessions,
  getTeacherSessions,
  getMyTeacherSessions,
  updateSessionStatus,
  completeOrder,
  cancelOrder,
  deleteSession,
  getSessionStats
} from '../controllers/sessionController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const sessionRouter = express.Router();

// Book a new session (requires authentication)
sessionRouter.post('/book', auth, bookSession);

// Get all sessions (admin only)
sessionRouter.get('/all', adminAuth, getAllSessions);

// Get sessions for logged-in student
sessionRouter.get('/student', auth, getStudentSessions);

// Get sessions for logged-in teacher (requires authentication)
sessionRouter.get('/teacher/my-sessions', auth, getMyTeacherSessions);

// Get sessions for a specific teacher
sessionRouter.get('/teacher/:teacherId', getTeacherSessions);

// Update session status (for teachers/admins - confirm only, not complete)
sessionRouter.put('/:sessionId/status', auth, updateSessionStatus);

// Complete order - ONLY for students
sessionRouter.put('/:sessionId/complete', auth, completeOrder);

// Cancel order - ONLY for teachers
sessionRouter.put('/:sessionId/cancel', auth, cancelOrder);

// Delete session (admin only)
sessionRouter.delete('/:sessionId', deleteSession);

// Get session statistics (admin only)
sessionRouter.get('/stats', adminAuth, getSessionStats);

export default sessionRouter;
