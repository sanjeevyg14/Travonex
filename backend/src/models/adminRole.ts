import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminRole extends Document {
  name: string;
  permissions: string[];
}

const adminRoleSchema = new Schema<IAdminRole>({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] },
});

export default mongoose.model<IAdminRole>('AdminRole', adminRoleSchema);
