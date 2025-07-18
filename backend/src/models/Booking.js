import mongoose from 'mongoose';

const travelerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    emergencyName: String,
    emergencyPhone: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    travelers: [travelerSchema],
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Booking', bookingSchema);
