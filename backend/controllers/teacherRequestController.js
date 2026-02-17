import { v2 as cloudinary } from "cloudinary";
import teacherRequestModel from "../models/teacherRequestModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Submit a teacher course request
const submitRequest = async (req, res) => {
  try {
    const teacherId = req.body.teacherId || req.user?.id;
    
    if (!teacherId) {
      return res.json({ success: false, message: "Teacher ID is required" });
    }

    // Get teacher user info
    const teacher = await userModel.findById(teacherId);
    if (!teacher) {
      return res.json({ success: false, message: "Teacher not found" });
    }

    // Validate required fields
    if (!req.body.fullName) {
      return res.json({ success: false, message: "Full Name is required" });
    }

    // Extract form data
    const {
      fullName,
      professionalTitle = "",
      profileImageUrl,
      rating,
      totalStudents,
      totalCourses,
      hourlyRate,
      yearsOfExperience,
      specialties,
      shortDescription,
      location,
      languages,
      email,
      phone,
      responseTime,
      availability,
      category,
      bestTeacher,
    } = req.body;

    // Handle image uploads
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = [];
    if (images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (image) => {
          // Check if buffer exists before processing
          if (!image.buffer) {
            throw new Error("Image buffer is missing");
          }
          const base64Image = Buffer.from(image.buffer).toString("base64");
          const dataURI = `data:${image.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.uploader.upload(dataURI);
          return uploadResponse.secure_url;
        })
      );
    }

    // Create request document
    const requestData = {
      teacherId,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      fullName,
      professionalTitle,
      profileImageUrl: profileImageUrl || (imagesUrl[0] || ""),
      rating: rating ? Number(rating) : undefined,
      totalStudents: totalStudents ? Number(totalStudents) : 0,
      totalCourses: totalCourses ? Number(totalCourses) : 0,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      yearsOfExperience,
      specialties,
      shortDescription,
      location,
      languages,
      email: email || teacher.email,
      phone,
      responseTime,
      availability,
      category,
      bestTeacher: bestTeacher === "true" || bestTeacher === true,
      image: imagesUrl,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const request = new teacherRequestModel(requestData);
    await request.save();

    res.json({ 
      success: true, 
      message: "Request submitted successfully. Waiting for admin approval.",
      request 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all requests (for admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await teacherRequestModel.find({}).sort({ createdAt: -1 });
    console.log('Fetching all teacher requests, found:', requests.length);
    res.json({ success: true, requests });
  } catch (error) {
    console.log('Error fetching requests:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get requests by teacher
const getTeacherRequests = async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) {
      return res.json({ success: false, message: "Teacher ID is required" });
    }

    const requests = await teacherRequestModel.find({ teacherId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update request status (approve/reject)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status, adminNotes } = req.body;
    
    if (!requestId || !status) {
      return res.json({ success: false, message: "Request ID and status are required" });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.json({ success: false, message: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    const request = await teacherRequestModel.findById(requestId);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    // If rejected, delete the request from database
    if (status === 'rejected') {
      await teacherRequestModel.findByIdAndDelete(requestId);
      res.json({ 
        success: true, 
        message: "Request rejected and deleted successfully"
      });
    } else {
      // If approved, update status (approve should use approveRequest function instead)
      request.status = status;
      request.adminNotes = adminNotes || "";
      request.reviewedAt = Date.now();
      request.reviewedBy = req.user?.id || "admin";
      request.updatedAt = Date.now();
      await request.save();

      res.json({ 
        success: true, 
        message: `Request ${status} successfully`,
        request 
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Approve request and add to products
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    const request = await teacherRequestModel.findById(requestId);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    if (request.status === 'approved') {
      return res.json({ success: false, message: "Request already approved" });
    }

    // Create product from request
    const productData = {
      teacherId: request.teacherId, // Link product to teacher
      fullName: request.fullName,
      professionalTitle: request.professionalTitle || "", // Provide default empty string if not provided
      profileImageUrl: request.profileImageUrl,
      rating: request.rating,
      totalStudents: request.totalStudents,
      totalCourses: request.totalCourses,
      hourlyRate: request.hourlyRate,
      yearsOfExperience: request.yearsOfExperience,
      specialties: request.specialties,
      shortDescription: request.shortDescription,
      location: request.location,
      languages: request.languages,
      email: request.email,
      phone: request.phone,
      responseTime: request.responseTime,
      availability: request.availability,
      category: request.category,
      bestTeacher: request.bestTeacher,
      image: request.image,
      date: Date.now()
    };

    const product = new productModel(productData);
    await product.save();

    // Update request status
    request.status = 'approved';
    request.reviewedAt = Date.now();
    request.reviewedBy = req.user?.id || "admin";
    request.updatedAt = Date.now();
    await request.save();

    res.json({ 
      success: true, 
      message: "Request approved and teacher added successfully",
      request,
      product 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { submitRequest, getAllRequests, getTeacherRequests, updateRequestStatus, approveRequest };
