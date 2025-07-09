import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  imageUrl: string;
  linkUrl: string;
}

const bannerSchema = new Schema<IBanner>({
  title: String,
  imageUrl: String,
  linkUrl: String,
});

export default mongoose.model<IBanner>('Banner', bannerSchema);
