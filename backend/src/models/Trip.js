import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    title: String,
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
