import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, required: true, unique: true },
  description: String,
  city: String,
  category: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
  price: Number,
  startDate: Date,
  endDate: Date,
  images: [String],
  // Flags managed by admins
  isFeatured: { type: Boolean, default: false },
  isBannerTrip: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Unlisted', 'Pending Approval', 'Rejected'],
    default: 'Pending Approval',
  },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
    title: String,
    slug: { type: String, required: true, unique: true },
    description: String,
    city: String,
    category: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
    price: Number,
    startDate: Date,
    endDate: Date,
    images: [String],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Trip', tripSchema);
