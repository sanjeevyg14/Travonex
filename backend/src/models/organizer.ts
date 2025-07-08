import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizer extends Document {
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  kycStatus: 'Incomplete' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
}

const organizerSchema = new Schema<IOrganizer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  joinDate: { type: Date, default: Date.now },
  kycStatus: {
    type: String,
    enum: ['Incomplete', 'Pending', 'Verified', 'Rejected', 'Suspended'],
    default: 'Incomplete',
  },
});

export default mongoose.model<IOrganizer>('Organizer', organizerSchema);
