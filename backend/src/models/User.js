import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const walletTransactionSchema = new mongoose.Schema({
    date: Date,
    description: String,
    amount: Number,
    type: { type: String, enum: ['Credit', 'Debit'] },
    source: String,
}, { _id: false });

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    pincode: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    avatar: String,
    gender: String,
    dateOfBirth: Date,
    bloodGroup: String,
    emergencyContact: String,
    address: addressSchema,
    interests: [String],
    travelPreferences: String,
    marketingOptIn: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    walletTransactions: [walletTransactionSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isProfileComplete: { type: Boolean, default: false },
    joinDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
