import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { 
    type: String, 
    enum: ['ADMIN', 'PRODUCTION', 'TEAM_LEADER', 'QA', 'LABELING'],
    required: true 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordSetupToken: String,
  passwordSetupExpires: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
