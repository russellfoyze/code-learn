import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

const adminAuth = async (req , res , next)=>{
 try {
    const { token } = req.headers
    if (!token) {
        return res.json({success:false , message: "Not Authorized"})
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user is admin from database
    const user = await userModel.findById(token_decode.id);
    if (!user || user.userType !== 'admin') {
        return res.json({success:false , message: "Not Authorized - Admin access required"})
    }
    
    req.user = { id: user._id.toString(), userType: user.userType };
    next()

 } catch (error) {
    res.json({success:false ,message:error.message})
 }

}

export default adminAuth