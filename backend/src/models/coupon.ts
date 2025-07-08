import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  isActive: boolean;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percent', 'amount'], required: true },
  discountValue: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model<ICoupon>('Coupon', couponSchema);
