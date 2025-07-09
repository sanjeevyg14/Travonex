import mongoose, { Schema, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
}

const faqSchema = new Schema<IFaq>({
  question: String,
  answer: String,
});

export default mongoose.model<IFaq>('Faq', faqSchema);
