import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB (using same connection as server)
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commarce`);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: 'admin', userType: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    // Create admin user
    const adminUser = new userModel({
      name: 'Admin',
      email: 'admin',
      password: hashedPassword,
      userType: 'admin',
      cartData: {}
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin');
    console.log('Password: admin');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

