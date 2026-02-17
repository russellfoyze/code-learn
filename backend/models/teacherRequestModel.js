import mongoose from "mongoose";

const teacherRequestSchema = new mongoose.Schema({
    // Teacher information
    teacherId: {type: String, required: true}, // User ID of the teacher who submitted the request
    teacherName: {type: String, required: true}, // Name from user account
    teacherEmail: {type: String, required: true}, // Email from user account
    
    // Course/Teacher data (same structure as productModel)
    fullName: {type: String, required: true},
    professionalTitle: {type: String, required: false},
    profileImageUrl: {type: String, required: false},
    rating: {type: Number, required: false, min: 0, max: 5},
    totalStudents: {type: Number, required: false, default: 0},
    totalCourses: {type: Number, required: false, default: 0},
    hourlyRate: {type: Number, required: false},
    yearsOfExperience: {type: String, required: false},
    specialties: {type: String, required: false}, // comma separated
    shortDescription: {type: String, required: false},
    location: {type: String, required: false},
    languages: {type: String, required: false}, // comma separated
    email: {type: String, required: false},
    phone: {type: String, required: false},
    responseTime: {type: String, required: false},
    availability: {type: String, required: false},
    category: {type: String, required: false}, // Programming language category
    bestTeacher: {type: Boolean, required: false, default: false},
    
    // Image URLs (stored as array)
    image: {type: Array, required: false}, // Array of image URLs
    
    // Request status
    status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
    
    // Admin feedback
    adminNotes: {type: String, required: false},
    
    // Timestamps
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    reviewedAt: {type: Number, required: false}, // When admin reviewed it
    reviewedBy: {type: String, required: false} // Admin user ID who reviewed it
});

const teacherRequestModel = mongoose.models.teacherRequest || mongoose.model("teacherRequest", teacherRequestSchema);

export default teacherRequestModel;

