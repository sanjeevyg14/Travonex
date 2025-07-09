import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  source: string;
}

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  firebaseUid: string;
  joinDate: Date;
  status: 'Active' | 'Suspended';
  avatar: string;
  walletBalance: number;
  isProfileComplete: boolean;
  wishlist: string[];
  walletTransactions: IWalletTransaction[];
}

const userSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  avatar: { type: String, default: '' },
  walletBalance: { type: Number, default: 0 },
  isProfileComplete: { type: Boolean, default: false },
  wishlist: { type: [String], default: [] },
  walletTransactions: {
    type: [
      new Schema<IWalletTransaction>({
        date: { type: Date, default: Date.now },
        description: String,
        amount: Number,
        type: { type: String, enum: ['Credit', 'Debit'] },
        source: String,
      })
    ],
    default: [],
  },
});

export default mongoose.model<IUser>('User', userSchema);
