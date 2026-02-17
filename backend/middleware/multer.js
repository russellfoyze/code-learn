import multer from 'multer';

// Use memory storage for file uploads (needed for Cloudinary)
// Files will be stored in memory as buffers instead of on disk
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload