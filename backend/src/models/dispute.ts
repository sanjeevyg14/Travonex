import mongoose, { Schema, Document } from 'mongoose';

export interface IDispute extends Document {
  bookingId: string;
  userId: string;
  organizerId: string;
  reason: string;
  status: 'Open' | 'Resolved' | 'Closed';
  dateReported: Date;
}

const disputeSchema = new Schema<IDispute>({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  organizerId: { type: String, required: true },
  reason: String,
  status: { type: String, enum: ['Open', 'Resolved', 'Closed'], default: 'Open' },
  dateReported: { type: Date, default: Date.now },
});

export default mongoose.model<IDispute>('Dispute', disputeSchema);
