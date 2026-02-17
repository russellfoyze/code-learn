import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commarce`);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Demo teachers data
const demoTeachers = [
  {
    fullName: "Sarah Chen",
    professionalTitle: "Senior Python Developer & Machine Learning Expert",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 4.9,
    totalStudents: 2500,
    totalCourses: 12,
    hourlyRate: 95,
    yearsOfExperience: "10 years",
    specialties: "Python, Machine Learning, Django, Data Science, TensorFlow",
    shortDescription: "Experienced Python developer with expertise in machine learning and data science. Helping students build real-world applications.",
    location: "San Francisco, CA",
    languages: "English, Mandarin",
    email: "sarah.chen@codelearn.com",
    phone: "+1 (555) 123-4567",
    responseTime: "Within 2 hours",
    availability: "Mon-Fri, 9 AM - 6 PM PST",
    category: "Python"
  },
  {
    fullName: "Michael Rodriguez",
    professionalTitle: "Full-Stack JavaScript Developer & React Specialist",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 4.8,
    totalStudents: 3200,
    totalCourses: 15,
    hourlyRate: 85,
    yearsOfExperience: "8 years",
    specialties: "JavaScript, React, Node.js, TypeScript, Express.js",
    shortDescription: "Passionate full-stack developer specializing in modern JavaScript frameworks. Creating engaging web applications.",
    location: "New York, NY",
    languages: "English, Spanish",
    email: "michael.rodriguez@codelearn.com",
    phone: "+1 (555) 234-5678",
    responseTime: "Within 1 hour",
    availability: "Mon-Fri, 10 AM - 7 PM EST",
    category: "JavaScript"
  },
  {
    fullName: "Emily Johnson",
    professionalTitle: "Senior Java Developer & Spring Framework Expert",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rating: 4.7,
    totalStudents: 1800,
    totalCourses: 10,
    hourlyRate: 90,
    yearsOfExperience: "12 years",
    specialties: "Java, Spring Boot, Microservices, Hibernate, REST APIs",
    shortDescription: "Expert Java developer with extensive experience in enterprise applications and microservices architecture.",
    location: "Seattle, WA",
    languages: "English",
    email: "emily.johnson@codelearn.com",
    phone: "+1 (555) 345-6789",
    responseTime: "Within 3 hours",
    availability: "Mon-Fri, 8 AM - 5 PM PST",
    category: "Java"
  },
  {
    fullName: "David Kim",
    professionalTitle: "C++ Systems Developer & Game Engine Architect",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    rating: 4.9,
    totalStudents: 1500,
    totalCourses: 8,
    hourlyRate: 100,
    yearsOfExperience: "15 years",
    specialties: "C++, Game Development, Unreal Engine, Systems Programming, Graphics Programming",
    shortDescription: "Veteran C++ developer specializing in game engines and high-performance systems programming.",
    location: "Austin, TX",
    languages: "English, Korean",
    email: "david.kim@codelearn.com",
    phone: "+1 (555) 456-7890",
    responseTime: "Within 4 hours",
    availability: "Mon-Fri, 9 AM - 6 PM CST",
    category: "C++"
  },
  {
    fullName: "Priya Patel",
    professionalTitle: "PHP & Laravel Expert | Backend Developer",
    profileImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    rating: 4.6,
    totalStudents: 2000,
    totalCourses: 11,
    hourlyRate: 75,
    yearsOfExperience: "7 years",
    specialties: "PHP, Laravel, MySQL, API Development, WordPress",
    shortDescription: "Skilled PHP developer with strong expertise in Laravel framework and backend development.",
    location: "Chicago, IL",
    languages: "English, Hindi",
    email: "priya.patel@codelearn.com",
    phone: "+1 (555) 567-8901",
    responseTime: "Within 2 hours",
    availability: "Mon-Fri, 9 AM - 6 PM CST",
    category: "PHP"
  }
];

// Seed function
const seedTeachers = async () => {
  try {
    await connectDB();
    
    // Clear existing teachers (optional - comment out if you want to keep existing data)
    // await productModel.deleteMany({});
    // console.log('Cleared existing teachers');
    
    // Insert demo teachers
    const inserted = await productModel.insertMany(demoTeachers);
    console.log(`Successfully inserted ${inserted.length} teachers`);
    
    // Display inserted teachers
    inserted.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.fullName} - ${teacher.category}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding teachers:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTeachers();

