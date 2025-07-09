import mongoose, { Schema, Document } from 'mongoose';

export interface IInterest extends Document {
  name: string;
  status: 'Active' | 'Inactive';
}

const interestSchema = new Schema<IInterest>({
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

export default mongoose.model<IInterest>('Interest', interestSchema);
