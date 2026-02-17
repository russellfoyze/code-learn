import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String , required:true},
    email:{type:String , required:true , unique:true},
    password:{type:String ,require:true},
    userType:{type:String , enum:['student', 'teacher', 'admin'], default:'student'},
    profileImageUrl:{type:String, required:false},
    cartData:{type:Object , default:{}},
    ratings:[{
        student:{ type: mongoose.Schema.Types.ObjectId, ref:'user' },
        rating:{ type:Number, min:1, max:5 }
    }],
    averageRating:{ type:Number, default:0 },
    ratingCount:{ type:Number, default:0 }
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
