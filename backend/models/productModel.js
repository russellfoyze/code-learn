import mongoose, { disconnect } from "mongoose";

const productSchema = new mongoose.Schema({
    // Teacher fields
    teacherId: {type: String, required: false}, // ID of the teacher who owns this course/product
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
    category: {type: String, required: false}, // Programming language category (Python, JavaScript, etc.)
    bestTeacher: {type: Boolean, required: false, default: false}, // Best teacher flag
    date: {type: Number, required: false, default: Date.now}, // Date for sorting latest teachers
    
    // Image field - can be array of image URLs or single image
    image: {type: Array, required: false, default: []},

    // Ratings stored on product as fallback when teacher user mapping is not available
    ratings:[{
        student:{ type: mongoose.Schema.Types.ObjectId, ref:'user' },
        rating:{ type:Number, min:1, max:5 }
    }],
    averageRating:{ type:Number, default:0 },
    ratingCount:{ type:Number, default:0 }
    
    // Legacy product fields (keeping for compatibility)
    // name:{type:String , required:false},
    // description:{type:String , required:false},
    // price:{type:Number , required:false},
    // discount:{type:Number , required:false},
    // category:{type:String , required:false},
    // subCategory:{type:String , required:false},
    // sizes:{type:Array , required:false},
    // bestseller:{type:Boolean , required:false},
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema)

export default  productModel;