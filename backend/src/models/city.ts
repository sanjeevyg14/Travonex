import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  enabled: boolean;
}

const citySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
});

export default mongoose.model<ICity>('City', citySchema);
