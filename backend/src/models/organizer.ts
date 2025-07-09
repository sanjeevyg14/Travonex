import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizerDocument {
  docType: string;
  docTitle: string;
  fileUrl?: string;
  uploadedAt?: Date;
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
  rejectionReason?: string;
}

export interface IOrganizer extends Document {
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  kycStatus: 'Incomplete' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
  organizerType?: string;
  address?: string;
  website?: string;
  experience?: number;
  specializations?: string[];
  authorizedSignatoryName?: string;
  authorizedSignatoryId?: string;
  emergencyContact?: string;
  documents: IOrganizerDocument[];
  vendorAgreementStatus: 'Not Submitted' | 'Submitted' | 'Verified' | 'Rejected';
  isProfileComplete: boolean;
}

const organizerSchema = new Schema<IOrganizer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  joinDate: { type: Date, default: Date.now },
  kycStatus: {
    type: String,
    enum: ['Incomplete', 'Pending', 'Verified', 'Rejected', 'Suspended'],
    default: 'Incomplete',
  },
  organizerType: String,
  address: String,
  website: String,
  experience: Number,
  specializations: [String],
  authorizedSignatoryName: String,
  authorizedSignatoryId: String,
  emergencyContact: String,
  documents: {
    type: [
      new Schema<IOrganizerDocument>({
        docType: String,
        docTitle: String,
        fileUrl: String,
        uploadedAt: Date,
        status: {
          type: String,
          enum: ['Pending', 'Uploaded', 'Verified', 'Rejected'],
          default: 'Pending',
        },
        rejectionReason: String,
      })
    ],
    default: [],
  },
  vendorAgreementStatus: {
    type: String,
    enum: ['Not Submitted', 'Submitted', 'Verified', 'Rejected'],
    default: 'Not Submitted',
  },
  isProfileComplete: { type: Boolean, default: false },
});

export default mongoose.model<IOrganizer>('Organizer', organizerSchema);
