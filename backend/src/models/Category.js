import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

export default mongoose.model('Category', categorySchema);
