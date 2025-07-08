import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  name: string;
  email: string;
  role: 'Super Admin' | 'Finance Manager' | 'Support Agent' | 'Operations Manager';
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: Date;
}

const adminUserSchema = new Schema<IAdminUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['Super Admin', 'Finance Manager', 'Support Agent', 'Operations Manager'],
    default: 'Support Agent',
  },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  lastLogin: Date,
});

export default mongoose.model<IAdminUser>('AdminUser', adminUserSchema);
