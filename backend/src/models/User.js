const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  phoneNumber: String,
  email: String,
  password: String,
  role: { type: String, enum: ['vendor', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', userSchema);
