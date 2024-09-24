import dotenv from 'dotenv';

dotenv.config();

import bcrypt from 'bcrypt';
import dbConnect from '../lib/mongoose.js';
import User from '../models/User.js';


async function hashPassword(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  return bcrypt.hash(password, saltRounds);
}

async function editAdminUser(adminEmail, newAdminData) {
  const { newName, newPassword, newRole } = newAdminData;

  try {
    await dbConnect();

// find existing admin in the database by email
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }
// update
    if (newName) admin.name = newName;
    if (newPassword) admin.password = await hashPassword(newPassword);
    if (newRole) admin.role = newRole;

    await admin.save();

    console.log('Admin user updated successfully:', admin._id);
  } catch (error) {
    console.error('Error updating admin user:', error);
  }
}

/**
 * --Test--
const newAdminData = {
  newName: 'New Admin Name',
  newPassword: 'NewAdminPassword',
  newRole: 'ADMIN',
};
 */

// check this again
const [,, adminEmail, newName, newPassword, newRole] = process.argv;

if (!adminEmail || !newName || !newPassword || !newRole) {
  console.error('Please provide all the required arguments: email, name, password, role.');
  process.exit(1);  // Exit the process with an error code
}

// Prepare the newAdminData object
const newAdminData = {
  newName,
  newPassword,
  newRole,
};
editAdminUser(adminEmail, newAdminData);
