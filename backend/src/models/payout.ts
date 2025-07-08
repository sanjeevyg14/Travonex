import mongoose, { Schema, Document } from 'mongoose';

export interface IPayout extends Document {
  tripId: string;
  batchId: string;
  organizerId: string;
  totalRevenue: number;
  platformCommission: number;
  netPayout: number;
  status: 'Pending' | 'Paid' | 'Failed';
  requestDate: Date;
  paidDate?: Date;
  paymentMode?: 'IMPS' | 'NEFT' | 'UPI' | 'Manual';
  utrNumber?: string;
  notes?: string;
}

const payoutSchema = new Schema<IPayout>({
  tripId: String,
  batchId: String,
  organizerId: String,
  totalRevenue: Number,
  platformCommission: Number,
  netPayout: Number,
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  paidDate: Date,
  paymentMode: String,
  utrNumber: String,
  notes: String,
});

export default mongoose.model<IPayout>('Payout', payoutSchema);
