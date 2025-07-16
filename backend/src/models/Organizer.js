import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const organizerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    logo: String,
    address: String,
    website: String,
    experience: Number,
    specializations: [String],
    kycStatus: String,
    vendorAgreementStatus: String,
    createdAt: { type: Date, default: Date.now },
});

organizerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

organizerSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Organizer', organizerSchema);
