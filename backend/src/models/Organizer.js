import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    logo: String,
    address: String,
    website: String,
    experience: Number,
    specializations: [String],
    kycStatus: String,
    vendorAgreementStatus: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Organizer', organizerSchema);
