import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: String,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.post('save', function(doc) {
  try {
    const { getIO } = require('../socket');
    getIO().to(doc.userId).emit('notification', doc);
  } catch (err) {
    // ignore if socket not initialized
  }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
