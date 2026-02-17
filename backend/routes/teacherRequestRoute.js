import express from 'express';
import { submitRequest, getAllRequests, getTeacherRequests, updateRequestStatus, approveRequest } from '../controllers/teacherRequestController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const teacherRequestRouter = express.Router();

// Teacher routes (requires authentication)
teacherRequestRouter.post('/submit', 
  auth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  submitRequest
);
teacherRequestRouter.post('/my-requests', auth, getTeacherRequests);

// Admin routes (requires admin authentication)
teacherRequestRouter.post('/admin/all', adminAuth, getAllRequests);
teacherRequestRouter.post('/admin/approve', adminAuth, approveRequest);
teacherRequestRouter.post('/admin/update-status', adminAuth, updateRequestStatus);

export default teacherRequestRouter;

