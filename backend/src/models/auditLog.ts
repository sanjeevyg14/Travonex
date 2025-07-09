import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: string;
  action: string;
  module: string;
  details: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  adminId: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
