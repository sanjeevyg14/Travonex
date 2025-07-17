import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  batchId: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
  totalRevenue: Number,
  platformCommission: Number,
  netPayout: Number,
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  paidDate: Date,
  paymentMode: String,
  utrNumber: String,
  invoiceUrl: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model('Payout', payoutSchema);
