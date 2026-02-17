import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import productModel from '../models/productModel.js'
import { v2 as cloudinary } from 'cloudinary'

const createToken = (id, userType)=>{
  return jwt.sign({id, userType},process.env.JWT_SECRET)
}

// Student login
const loginStudent = async (req, res) => {
 try {
  const {email , password} = req.body;
  const user = await userModel.findOne({email, userType: 'student'});

  if (!user){
    return res.json({success:false, message:"Student account does not exist"})
  }

   const isMatch = await bcrypt.compare(password, user.password)

  if(isMatch){
    const token = createToken(user._id, user.userType)
    // Return user data along with token
    res.json({
      success:true, 
      token, 
      userType: 'student',
      userId: user._id,
      userName: user.name,
      userEmail: user.email
    })
  }
  else{
    res.json({success:false , message:"Invalid password"})
  }

 } catch (error) {
  console.log(error);
  res.json({success:false , message:error.message})
 }
};

// Teacher login
const loginTeacher = async (req, res) => {
 try {
  const {email , password} = req.body;
  const user = await userModel.findOne({email, userType: 'teacher'});

  if (!user){
    return res.json({success:false, message:"Teacher account does not exist"})
  }

   const isMatch = await bcrypt.compare(password, user.password)

  if(isMatch){
    const token = createToken(user._id, user.userType)
    res.json({success:true, token, userType: 'teacher', userId: user._id})
  }
  else{
    res.json({success:false , message:"Invalid password"})
  }

 } catch (error) {
  console.log(error);
  res.json({success:false , message:error.message})
 }
};

// Student register
const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({success:false , message:"Please enter a valid email"})
    }
    if (password.length < 6) {
      return res.json({success:false , message:"Enter a strong password (min 6 characters)"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password , salt)

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      userType: 'student'
    })

    const user = await newUser.save()
    const token = createToken(user._id, user.userType)

    res.json({
      success:true , 
      token, 
      userType: 'student',
      userId: user._id,
      userName: user.name,
      userEmail: user.email
    })

  } catch (error) {
    console.log(error);
    res.json({success:false ,message:error.message})
  }
};

// Teacher register
const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already registered" });
    }

    if (!validator.isEmail(email)) {
      return res.json({success:false , message:"Please enter a valid email"})
    }
    if (password.length < 6) {
      return res.json({success:false , message:"Enter a strong password (min 6 characters)"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password , salt)

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      userType: 'teacher'
    })

    const user = await newUser.save()
    const token = createToken(user._id, user.userType)

    res.json({success:true , token, userType: 'teacher', userId: user._id})

  } catch (error) {
    console.log(error);
    res.json({success:false ,message:error.message})
  }
};

// Admin login (using database - username and password)
const adminLogin = async (req, res) => {
  try {
    const {username, password} = req.body;

    if (!username) {
      return res.json({success: false, message: "Username is required"});
    }

    if (!password) {
      return res.json({success: false, message: "Password is required"});
    }

    // Find admin user in database by username (name field) and userType
    const user = await userModel.findOne({name: username, userType: 'admin'});

    if (!user) {
      return res.json({success: false, message: "Invalid admin username or password"});
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id, user.userType);
      res.json({success: true, token, userType: 'admin', userId: user._id});
    } else {
      res.json({success: false, message: "Invalid admin username or password"});
    }

  } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message});
  }
};

// Forgot Password (for admin only, for demo purposes - INSECURE)
const forgotPassword = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.json({ success: false, message: 'Username and Email are required' });
    }
    // Find admin by username (name) and email
    const user = await userModel.findOne({ name: username, email, userType: 'admin' });
    if (!user) {
      return res.json({ success: false, message: 'No user found with those credentials' });
    }
    // WARNING: For demo only. Insecure to expose passwords!
    return res.json({ success: true, password: user.password });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Helper: resolve teacher user document OR product fallback by param
const resolveTeacherTarget = async (teacherIdParam) => {
  // Try user
  let teacherUser = await userModel.findOne({ _id: teacherIdParam, userType: 'teacher' });
  if (teacherUser) return { teacherUser, product: null };
  // Try product
  const product = await productModel.findById(teacherIdParam);
  if (product) {
    // If product.teacherId points to a user, try that
    if (product.teacherId) {
      teacherUser = await userModel.findOne({ _id: product.teacherId, userType: 'teacher' });
      if (teacherUser) return { teacherUser, product };
    }
    // Fallback: rate on product itself
    return { teacherUser: null, product };
  }
  return { teacherUser: null, product: null };
};

// Rate a teacher (student only)
const rateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { rating } = req.body;

    if (!req.user || req.user.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can rate teachers' });
    }

    const numericRating = Number(rating);
    if (!teacherId || !numericRating || numericRating < 1 || numericRating > 5) {
      return res.json({ success: false, message: 'Valid rating (1-5) and teacherId are required' });
    }

    const { teacherUser, product } = await resolveTeacherTarget(teacherId);

    if (!teacherUser && !product) {
      return res.json({ success: false, message: 'Teacher not found' });
    }

    // Write rating on teacher user if available; otherwise on product fallback
    const target = teacherUser || product;

    // Upsert rating by this student
    const existingIndex = (target.ratings || []).findIndex(r => String(r.student) === String(req.user.id));
    if (existingIndex >= 0) {
      target.ratings[existingIndex].rating = numericRating;
    } else {
      target.ratings.push({ student: req.user.id, rating: numericRating });
    }

    // Recompute average and count
    const count = target.ratings.length;
    const sum = target.ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    target.ratingCount = count;
    target.averageRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;

    await target.save();

    return res.json({ success: true, averageRating: target.averageRating, ratingCount: target.ratingCount });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get teacher rating summary
const getTeacherRating = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { teacherUser, product } = await resolveTeacherTarget(teacherId);
    if (!teacherUser && !product) {
      return res.json({ success: false, message: 'Teacher not found' });
    }
    const target = teacherUser || product;
    return res.json({ success: true, averageRating: target.averageRating || 0, ratingCount: target.ratingCount || 0 });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get the current student's rating for a teacher (or product fallback)
const getMyTeacherRating = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!req.user || req.user.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can view their rating' });
    }

    const { teacherUser, product } = await resolveTeacherTarget(teacherId);
    if (!teacherUser && !product) {
      return res.json({ success: false, message: 'Teacher not found' });
    }
    const target = teacherUser || product;

    const ratings = target.ratings || [];
    const mine = ratings.find(r => String(r.student) === String(req.user.id));
    return res.json({ success: true, rating: mine?.rating || 0 });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update current user's profile image (student or any user)
const updateProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const file = req.file;
    if (!file || !file.buffer) {
      return res.json({ success: false, message: 'Image file is required' });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) reject(error); else resolve(result);
      });
      uploadStream.end(file.buffer);
    });

    user.profileImageUrl = uploadResult.secure_url;
    await user.save();

    return res.json({ success: true, profileImageUrl: user.profileImageUrl });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Legacy login (defaults to student)
const loginUser = async (req, res) => {
  return loginStudent(req, res);
};

// Legacy register (defaults to student)
const registerUser = async (req, res) => {
  return registerStudent(req, res);
};

export { loginStudent, loginTeacher, registerStudent, registerTeacher, adminLogin, loginUser, registerUser, forgotPassword, rateTeacher, getTeacherRating, getMyTeacherRating, updateProfileImage };
