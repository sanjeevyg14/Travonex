import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: String,
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  targetCollection: String,
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);
