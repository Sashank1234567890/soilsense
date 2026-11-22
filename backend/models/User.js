const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'agronomist', 'student', 'researcher'], 
    default: 'farmer' 
  },
  phone: { type: String, trim: true },
  state: { type: String, required: true, default: 'Punjab', trim: true },
  district: { type: String, required: true, default: 'Ludhiana', trim: true },
  village: { type: String, default: 'Jagraon', trim: true },
  plotName: { type: String, default: 'Plot 01', trim: true },
  avatarUrl: { type: String, default: '' }
}, {
  timestamps: true
});

userSchema.index({ state: 1, district: 1 });

// Hash password before save if modified
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
