import mongoose, { Schema, Document } from 'mongoose';

export interface IContentPage extends Document {
  slug: string;
  content: string;
}

const contentPageSchema = new Schema<IContentPage>({
  slug: { type: String, required: true, unique: true },
  content: String,
});

export default mongoose.model<IContentPage>('ContentPage', contentPageSchema);
