import express from 'express'
import { 
  bookSession, 
  getAllSessions, 
  getStudentSessions, 
  getTeacherSessions, 
  updateSessionStatus, 
  deleteSession, 
  getSessionStats 
} from '../controllers/sessionController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Book a new session (requires authentication)
router.post('/book', auth, bookSession)

// Get all sessions (admin only)
router.get('/all', getAllSessions)

// Get sessions by student (requires authentication)
router.get('/student', auth, getStudentSessions)

// Get sessions by teacher
router.get('/teacher/:teacherId', getTeacherSessions)

// Update session status (admin only)
router.put('/:sessionId/status', updateSessionStatus)

// Delete session (admin only)
router.delete('/:sessionId', deleteSession)

// Get session statistics (admin only)
router.get('/stats', getSessionStats)

export default router
