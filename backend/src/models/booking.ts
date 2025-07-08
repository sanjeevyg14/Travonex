import mongoose, { Schema, Document } from 'mongoose';

export interface ITraveler {
  name: string;
  email: string;
  phone: string;
}

export interface IBooking extends Document {
  tripId: string;
  userId: string;
  batchId: string;
  bookingDate: Date;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending';
  amount: number;
  couponCodeUsed?: string;
  couponDiscount?: number;
  walletAmountUsed?: number;
  razorpayOrderId?: string;
  transactionId?: string;
  travelers: ITraveler[];
}

const travelerSchema = new Schema<ITraveler>({
  name: String,
  email: String,
  phone: String,
});

const bookingSchema = new Schema<IBooking>({
  tripId: { type: String, required: true },
  userId: { type: String, required: true },
  batchId: { type: String, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Confirmed', 'Completed', 'Cancelled', 'Pending'],
    default: 'Pending',
  },
  amount: Number,
  couponCodeUsed: String,
  couponDiscount: Number,
  walletAmountUsed: Number,
  razorpayOrderId: String,
  transactionId: String,
  travelers: [travelerSchema],
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
