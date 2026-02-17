import express from "express";
import { loginStudent, loginTeacher, registerStudent, registerTeacher, adminLogin, loginUser, registerUser, forgotPassword, rateTeacher, getTeacherRating, getMyTeacherRating, updateProfileImage } from "../controllers/userController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

const userRouter = express.Router();

// New specific routes
userRouter.post('/student/register', registerStudent)
userRouter.post('/student/login', loginStudent)
userRouter.post('/teacher/register', registerTeacher)
userRouter.post('/teacher/login', loginTeacher)
userRouter.post('/admin/login', adminLogin)
userRouter.post('/admin/forgot-password', forgotPassword)

// Rating routes
userRouter.post('/teacher/:teacherId/rate', auth, rateTeacher)
userRouter.get('/teacher/:teacherId/rating', getTeacherRating)
userRouter.get('/teacher/:teacherId/my-rating', auth, getMyTeacherRating)

// Profile image upload (current user)
userRouter.post('/me/profile-image', auth, upload.single('image'), updateProfileImage)

// Legacy routes (for backward compatibility)
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

export default userRouter;
