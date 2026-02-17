import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const auth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await userModel.findById(token_decode.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found"
      });
    }

    // Add user info to request including userType
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType
    };
    
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export default auth;
