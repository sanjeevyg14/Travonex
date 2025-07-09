import mongoose, { Schema, Document } from 'mongoose';

export interface ITripBatch {
  id: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  priceOverride?: number;
  availableSlots: number;
}

export interface IPoint {
  label: string;
  time: string;
  mapsLink: string;
}

export interface IItineraryItem {
  day: number;
  title: string;
  description: string;
  image?: string;
  imageHint?: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface ITrip extends Document {
  slug: string;
  title: string;
  location: string;
  city: string;
  tripType: string;
  difficulty?: string;
  duration?: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
  pickupCity?: string;
  pickupPoints?: IPoint[];
  dropoffPoints?: IPoint[];
  interests?: string[];
  category?: string;
  isFeaturedRequest?: boolean;

  // Pricing
  price: number;
  taxIncluded?: boolean;
  taxPercentage?: number;

  // Visuals
  image: string;
  imageHint?: string;
  gallery?: { url: string; hint: string }[];

  // Details
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: IItineraryItem[];

  // Batches & Policies
  batches: ITripBatch[];
  cancellationPolicy?: string;
  cancellationRules?: { days: number; refundPercentage: number }[];
  faqs?: IFAQ[];

  // Metadata & Status
  reviews?: { id: string; userId: string; rating: number; comment: string }[];
  organizerId: string;
  isFeatured?: boolean;
  isBannerTrip?: boolean;
  status: 'Published' | 'Draft' | 'Unlisted' | 'Pending Approval' | 'Rejected';
  adminNotes?: string;
}

const batchSchema = new Schema<ITripBatch>({
  id: { type: String, required: true },
  startDate: String,
  endDate: String,
  maxParticipants: Number,
  priceOverride: Number,
  availableSlots: Number,
});

const pointSchema = new Schema<IPoint>({
  label: String,
  time: String,
  mapsLink: String,
}, { _id: false });

const itineraryItemSchema = new Schema<IItineraryItem>({
  day: Number,
  title: String,
  description: String,
  image: String,
  imageHint: String,
}, { _id: false });

const faqSchema = new Schema<IFAQ>({
  question: String,
  answer: String,
}, { _id: false });

const gallerySchema = new Schema({ url: String, hint: String }, { _id: false });

const reviewSchema = new Schema({
  id: String,
  userId: String,
  rating: Number,
  comment: String,
}, { _id: false });

const tripSchema = new Schema<ITrip>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  location: String,
  city: String,
  tripType: String,
  difficulty: String,
  duration: String,
  description: String,
  minAge: Number,
  maxAge: Number,
  pickupCity: String,
  pickupPoints: [pointSchema],
  dropoffPoints: [pointSchema],
  interests: [String],
  category: String,
  isFeaturedRequest: { type: Boolean, default: false },

  price: Number,
  taxIncluded: Boolean,
  taxPercentage: Number,

  image: String,
  imageHint: String,
  gallery: [gallerySchema],

  inclusions: [String],
  exclusions: [String],
  itinerary: [itineraryItemSchema],

  batches: [batchSchema],
  cancellationPolicy: String,
  cancellationRules: [{ days: Number, refundPercentage: Number }],
  faqs: [faqSchema],

  reviews: [reviewSchema],
  organizerId: String,
  isFeatured: { type: Boolean, default: false },
  isBannerTrip: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Unlisted', 'Pending Approval', 'Rejected'],
    default: 'Draft',
  },
  adminNotes: String,
});

export default mongoose.model<ITrip>('Trip', tripSchema);
