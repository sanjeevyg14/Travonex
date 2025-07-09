import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  type: 'Fixed' | 'Percentage';
  value: number;
  usage: number;
  limit: number;
  status: 'Active' | 'Inactive';
  expiryDate: Date;
}

const promoCodeSchema = new Schema<IPromoCode>({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Fixed', 'Percentage'], required: true },
  value: { type: Number, required: true },
  usage: { type: Number, default: 0 },
  limit: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  expiryDate: Date,
});

export default mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
