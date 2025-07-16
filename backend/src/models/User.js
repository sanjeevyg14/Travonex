import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String, // For social/phone auth, can be empty
    role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
