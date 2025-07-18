import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dispute', disputeSchema);
