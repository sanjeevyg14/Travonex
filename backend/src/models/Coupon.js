import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model('Coupon', couponSchema);
