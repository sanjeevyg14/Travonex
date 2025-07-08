import mongoose, { Schema, Document } from 'mongoose';

export interface ITripBatch {
  id: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  priceOverride?: number;
  availableSlots: number;
}

export interface ITrip extends Document {
  slug: string;
  title: string;
  location: string;
  city: string;
  tripType: string;
  price: number;
  image: string;
  batches: ITripBatch[];
  organizerId: string;
  cancellationRules?: { days: number; refundPercentage: number }[];

  status: 'Published' | 'Draft' | 'Unlisted' | 'Pending Approval' | 'Rejected';


status: 'Published' | 'Draft' | 'Unlisted' | 'Pending Approval' | 'Rejected';

}

const batchSchema = new Schema<ITripBatch>({
  id: { type: String, required: true },
  startDate: String,
  endDate: String,
  maxParticipants: Number,
  priceOverride: Number,
  availableSlots: Number,
});

const tripSchema = new Schema<ITrip>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  location: String,
  city: String,
  tripType: String,
  price: Number,
  image: String,
  batches: [batchSchema],
  organizerId: String,
  cancellationRules: [{ days: Number, refundPercentage: Number }],
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Unlisted', 'Pending Approval', 'Rejected'],
    default: 'Draft',
  },
});

export default mongoose.model<ITrip>('Trip', tripSchema);
