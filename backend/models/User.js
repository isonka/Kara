const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['admin', 'user', 'owner'], default: 'user' }
});

module.exports = mongoose.model('User', UserSchema);
