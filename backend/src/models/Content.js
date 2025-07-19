import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  body: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Content', contentSchema);
