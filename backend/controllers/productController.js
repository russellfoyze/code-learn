// function for add product
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { disconnect } from "mongoose";

const addProduct = async (req, res) => {
  try {
    // Debug: Log received data
    console.log("Received req.body:", req.body);
    
    // Validate required teacher fields
    if (!req.body.fullName) {
      return res.json({ success: false, message: "Full Name is required" });
    }
    if (!req.body.professionalTitle) {
      return res.json({ success: false, message: "Professional Title is required" });
    }
    
    // Extract teacher fields
    const {
      fullName,
      professionalTitle,
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
      bestTeacher,
    } = req.body;

    // Extract legacy product fields
    const {
      name,
      description,
      price,
      discount ,
      category,
      subCategory,
      size,
      bestseller,
    } = req.body;
    // Handle file uploads - files are optional
    const image1 = req.files && req.files.image1 && req.files.image1[0];
    const image2 = req.files && req.files.image2 && req.files.image2[0];
    const image3 = req.files && req.files.image3 && req.files.image3[0];
    const image4 = req.files && req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined && item !== null
    );

    let imagesUrl = [];
    
    // Only upload to Cloudinary if there are images
    if (images.length > 0) {
      // For memory storage, use buffer instead of path
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          // Convert buffer to data URI or upload buffer directly
          const uploadOptions = {
            resource_type: "image",
          };
          
          // If it's a buffer (memory storage), use upload_stream
          if (item.buffer) {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              );
              uploadStream.end(item.buffer);
            });
          } else {
            // If it has a path (disk storage)
            const result = await cloudinary.uploader.upload(item.path, uploadOptions);
            return result.secure_url;
          }
        })
      );
    }

    const productData = {
      // Teacher fields
      fullName,
      professionalTitle,
      profileImageUrl,
      rating: rating ? Number(rating) : undefined,
      totalStudents: totalStudents ? Number(totalStudents) : 0,
      totalCourses: totalCourses ? Number(totalCourses) : 0,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      yearsOfExperience,
      specialties,
      shortDescription,
      location,
      languages,
      email,
      phone,
      responseTime,
      availability,
      bestTeacher: bestTeacher === "true" ? true : false,
      date: req.body.date || Date.now(),
      
      // Legacy product fields
      name,
      description,
      category,
      price: price ? Number(price) : undefined,
      discount: discount ? Number(discount) : undefined,
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
      image: imagesUrl,
      date: Date.now(),
    };
    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "product Added" });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};

// funtion for list product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};
// remove product

const removeProduct = async (req, res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true , message:"product removed"})
    } catch (error) {
        console.log(error);

        res.json({ success: false, message: error.message });
    }

};
// function for single product info
const singleProduct = async (req, res) => {

    try {
        
        const { productid } = req.body 
        const product = await productModel.findById(productid)
        res.json({success:true, product})

    } catch (error) {
        console.log(error);

        res.json({ success: false, message: error.message });
    }


};

export { listProduct, addProduct, removeProduct, singleProduct };
