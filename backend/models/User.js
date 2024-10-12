const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'default_username', required: true },
  email: { type: String, required: true, unique: true },
  otp: { type: Number, length: 6 },
  otpExpiry: { type: Date},
  jwtToken: { type: String },
  isActive: {type: Boolean, required: true, default: true},
  password: {type: String, required: true},
  notification: {
    type: String,
    enum: ['mute', 'all', 'priority'],
    default: 'all',
    required: true
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
