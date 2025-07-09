import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  status: 'Active' | 'Inactive';
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

export default mongoose.model<ICategory>('Category', categorySchema);
