import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
    name: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

export default mongoose.model('Interest', interestSchema);
