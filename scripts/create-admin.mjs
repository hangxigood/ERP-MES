import dotenv from 'dotenv';

dotenv.config();

import bcrypt from 'bcrypt';
import dbConnect from '../lib/mongoose.js';
import User from '../models/User.js';


async function hashPassword(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  return bcrypt.hash(password, saltRounds);
}

async function createAdminUser() {    
  const adminName = process.env.ADMIN_NAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    await dbConnect();

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    const admin = new User({
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
    });

    await admin.save();

    console.log('Admin user created successfully:', admin._id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();