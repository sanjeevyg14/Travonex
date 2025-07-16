import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    name: String,
    enabled: { type: Boolean, default: true },
});

export default mongoose.model('City', citySchema);
