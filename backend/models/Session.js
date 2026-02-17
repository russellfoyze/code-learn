import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  // Teacher information
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product', // Reference to the teacher/product
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  teacherEmail: {
    type: String,
    required: false
  },
  
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  
  // Session details
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  type: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },
  specialRequests: {
    type: String,
    required: false
  },
  
  // Pricing
  hourlyRate: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bkash', 'bank_transfer', 'online'],
    required: false
  },
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  
  // Additional fields
  meetingLink: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  
  // Location for in-person sessions
  location: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

// Index for better query performance
sessionSchema.index({ teacherId: 1, scheduledDate: 1 })
sessionSchema.index({ studentId: 1, status: 1 })
sessionSchema.index({ status: 1, scheduledDate: 1 })

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema)

export default Session
