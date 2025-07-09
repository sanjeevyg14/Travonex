import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  tripId: string;
  userId: string;
  organizerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  tripId: { type: String, required: true },
  userId: { type: String, required: true },
  organizerId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', reviewSchema);
