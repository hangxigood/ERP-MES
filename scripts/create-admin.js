import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    // Connect to the database
    await mongoose.connect("process.env.DATABASE_URL", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@SMI.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SMIpassword', salt);

    // Create the admin user
    const adminUser = new User({
      name: 'admin',
      email: 'admin@SMI.com',
      password: hashedPassword,
      role: 'ADMIN',
    });

    // Save the admin user
    await adminUser.save();

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
};

seedAdmin();