import Session from '../models/Session.js'
import productModel from '../models/productModel.js'
import userModel from '../models/userModel.js'

// Book a new session
export const bookSession = async (req, res) => {
  try {
    const {
      teacherId,
      title,
      description,
      scheduledDate,
      duration,
      type,
      specialRequests,
      price,
      paymentMethod
    } = req.body

    // Get teacher information
    const teacher = await productModel.findById(teacherId)
    if (!teacher) {
      return res.json({ success: false, message: 'Teacher not found' })
    }

    // Get student information from token (assuming user is logged in)
    const studentId = req.user.id // This should come from auth middleware
    const student = await userModel.findById(studentId)
    if (!student) {
      return res.json({ success: false, message: 'Student not found' })
    }

    // Calculate total price
    const hourlyRate = teacher.hourlyRate || price || 0
    const totalPrice = (hourlyRate * duration) / 60

    // Create session
    const sessionData = {
      teacherId,
      teacherName: teacher.fullName,
      teacherEmail: teacher.email || '',
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      title,
      description: description || '',
      scheduledDate: new Date(scheduledDate),
      duration,
      type: type || 'online',
      specialRequests: specialRequests || '',
      hourlyRate,
      totalPrice,
      paymentMethod: paymentMethod || null,
      paymentStatus: paymentMethod ? 'paid' : 'pending'
    }

    const session = new Session(sessionData)
    await session.save()

    res.json({ 
      success: true, 
      message: 'Session booked successfully',
      session: session
    })

  } catch (error) {
    console.error('Error booking session:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to book session' 
    })
  }
}

// Get all sessions (for admin)
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('teacherId', 'fullName professionalTitle image profileImageUrl')
      .populate('studentId', 'name email _id')
      .sort({ createdAt: -1, bookedAt: -1 })

    res.json({ 
      success: true, 
      sessions: sessions 
    })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to fetch sessions' 
    })
  }
}

// Get sessions by student
export const getStudentSessions = async (req, res) => {
  try {
    const studentId = req.user.id
    const sessions = await Session.find({ studentId })
      .populate('teacherId', 'fullName professionalTitle image profileImageUrl')
      .sort({ scheduledDate: -1 })

    res.json({ 
      success: true, 
      sessions: sessions 
    })

  } catch (error) {
    console.error('Error fetching student sessions:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to fetch sessions' 
    })
  }
}

// Get sessions by teacher
export const getTeacherSessions = async (req, res) => {
  try {
    const teacherId = req.params.teacherId
    const sessions = await Session.find({ teacherId })
      .populate('studentId', 'name email _id')
      .sort({ scheduledDate: -1 })

    res.json({ 
      success: true, 
      sessions: sessions 
    })

  } catch (error) {
    console.error('Error fetching teacher sessions:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to fetch sessions' 
    })
  }
}

// Get sessions for currently authenticated teacher
export const getMyTeacherSessions = async (req, res) => {
  try {
    const userId = req.user.id // This is the user's ID from token
    
    // Find the teacher's product/profile by teacherId (userId)
    const teacherProduct = await productModel.findOne({ teacherId: userId })
    
    if (!teacherProduct) {
      return res.json({ 
        success: false, 
        message: 'Teacher profile not found' 
      })
    }

    // Get sessions for this teacher's product
    const sessions = await Session.find({ teacherId: teacherProduct._id })
      .populate('studentId', 'name email _id')
      .sort({ scheduledDate: -1 })

    res.json({ 
      success: true, 
      sessions: sessions 
    })

  } catch (error) {
    console.error('Error fetching teacher sessions:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to fetch sessions' 
    })
  }
}

// Update session status (for teachers/admins - NO completion allowed)
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params
    const { status, notes, meetingLink } = req.body
    const userType = req.user.userType // Get user type from token

    // Students cannot use this endpoint to complete orders
    // Only teachers/admins can use this for confirming sessions
    if (userType === 'student' && status === 'completed') {
      return res.json({ 
        success: false, 
        message: 'Students must use the complete order endpoint' 
      })
    }

    const updateData = { status }
    if (notes) updateData.notes = notes
    if (meetingLink) updateData.meetingLink = meetingLink

    // Set confirmation timestamp (NOT completion - only students can complete)
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date()
    }
    // Do not allow completion here - students must use completeOrder endpoint

    const session = await Session.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    ).populate('teacherId', 'fullName professionalTitle')
     .populate('studentId', 'name email')

    if (!session) {
      return res.json({ success: false, message: 'Session not found' })
    }

    res.json({ 
      success: true, 
      message: 'Session status updated successfully',
      session: session
    })

  } catch (error) {
    console.error('Error updating session status:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to update session status' 
    })
  }
}

// Complete order - ONLY for students
export const completeOrder = async (req, res) => {
  try {
    const { sessionId } = req.params
    const studentId = req.user.id // Get student ID from token
    const userType = req.user.userType // Get user type from token

    // Only students can complete orders
    if (userType !== 'student') {
      return res.json({ 
        success: false, 
        message: 'Only students can complete orders' 
      })
    }

    // Find the session
    const session = await Session.findById(sessionId)
    
    if (!session) {
      return res.json({ success: false, message: 'Session not found' })
    }

    // Verify that the session belongs to this student
    if (session.studentId.toString() !== studentId.toString()) {
      return res.json({ 
        success: false, 
        message: 'You can only complete your own orders' 
      })
    }

    // Only allow completion if status is 'confirmed' or 'pending'
    if (session.status === 'completed') {
      return res.json({ 
        success: false, 
        message: 'This order is already completed' 
      })
    }

    if (session.status === 'cancelled') {
      return res.json({ 
        success: false, 
        message: 'Cannot complete a cancelled order' 
      })
    }

    // Update session to completed
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    ).populate('teacherId', 'fullName professionalTitle image')
     .populate('studentId', 'name email')

    res.json({ 
      success: true, 
      message: 'Order completed successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('Error completing order:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to complete order' 
    })
  }
}

// Cancel order - ONLY for teachers
export const cancelOrder = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id // Get user ID from token
    const userType = req.user.userType // Get user type from token

    // Only teachers can cancel orders
    if (userType !== 'teacher') {
      return res.json({ 
        success: false, 
        message: 'Only teachers can cancel orders' 
      })
    }

    // Find the session
    const session = await Session.findById(sessionId)
    
    if (!session) {
      return res.json({ success: false, message: 'Session not found' })
    }

    // Verify that the session belongs to this teacher
    // First, find the teacher's product/profile
    const teacherProduct = await productModel.findOne({ teacherId: userId })
    
    if (!teacherProduct) {
      return res.json({ 
        success: false, 
        message: 'Teacher profile not found' 
      })
    }

    // Verify the session belongs to this teacher's product
    if (session.teacherId.toString() !== teacherProduct._id.toString()) {
      return res.json({ 
        success: false, 
        message: 'You can only cancel your own orders' 
      })
    }

    // Only allow cancellation if status is not already cancelled or completed
    if (session.status === 'cancelled') {
      return res.json({ 
        success: false, 
        message: 'This order is already cancelled' 
      })
    }

    if (session.status === 'completed') {
      return res.json({ 
        success: false, 
        message: 'Cannot cancel a completed order' 
      })
    }

    // Update session to cancelled
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { 
        status: 'cancelled'
      },
      { new: true }
    ).populate('teacherId', 'fullName professionalTitle image')
     .populate('studentId', 'name email _id')

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to cancel order' 
    })
  }
}

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params

    const session = await Session.findByIdAndDelete(sessionId)
    if (!session) {
      return res.json({ success: false, message: 'Session not found' })
    }

    res.json({ 
      success: true, 
      message: 'Session deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting session:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to delete session' 
    })
  }
}

// Get session statistics
export const getSessionStats = async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments()
    const pendingSessions = await Session.countDocuments({ status: 'pending' })
    const confirmedSessions = await Session.countDocuments({ status: 'confirmed' })
    const completedSessions = await Session.countDocuments({ status: 'completed' })
    const cancelledSessions = await Session.countDocuments({ status: 'cancelled' })

    // Calculate total revenue
    const revenueResult = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    res.json({
      success: true,
      stats: {
        totalSessions,
        pendingSessions,
        confirmedSessions,
        completedSessions,
        cancelledSessions,
        totalRevenue
      }
    })

  } catch (error) {
    console.error('Error fetching session stats:', error)
    res.json({ 
      success: false, 
      message: error.message || 'Failed to fetch session statistics' 
    })
  }
}