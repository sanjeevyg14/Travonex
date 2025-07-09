import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSetting extends Document {
  section: string;
  settings: Record<string, any>;
}

const adminSettingSchema = new Schema<IAdminSetting>({
  section: { type: String, required: true, unique: true },
  settings: { type: Schema.Types.Mixed, default: {} },
});

export default mongoose.model<IAdminSetting>('AdminSetting', adminSettingSchema);
