import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  status: 'Active' | 'Suspended';
  avatar: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  avatar: { type: String, default: '' },
});

export default mongoose.model<IUser>('User', userSchema);
