import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Booking', bookingSchema);
