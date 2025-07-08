/**
 * @fileoverview
 * This file contains all the core TypeScript types and interfaces used across the application.
 * It serves as a single source of truth for the data structures,
 * making it easier to maintain and ensuring consistency between the frontend and backend.
 * These types would ideally be shared in a monorepo or generated from a backend schema.
 */

import type { LucideIcon } from "lucide-react";

// DEV_COMMENT: Represents a single geographic point for pickup or drop-off.
export interface Point {
    label: string; // e.g., "Delhi ISBT" or "Manali Bus Stand"
    time: string; // e.g., "06:00 AM"
    mapsLink: string; // URL to Google Maps
}

/**
 * @interface TripBatch
 * @description Represents a specific scheduled departure for a trip.
 * A single trip can have multiple batches, each with its own dates, capacity, and potentially a different price.
 */
export interface TripBatch {
  id: string;
  startDate: string; // ISO 8601 format: "YYYY-MM-DD"
  endDate: string; // ISO 8601 format: "YYYY-MM-DD"
  bookingCutoffDate?: string; // Optional: Last date for booking this batch
  maxParticipants: number;
  priceOverride?: number; // Optional: If set, this price is used instead of the trip's default price.
  status: 'Active' | 'Inactive' | 'Pending Approval' | 'Rejected'; // Batch-level status, managed by admin.
  notes?: string; // Internal or public notes, e.g., "Festival Special"
  availableSlots: number; // This would be dynamically calculated on the backend (maxParticipants - currentBookings)
}

/**
 * @interface CancellationRule
 * @description Defines a single rule for the trip's cancellation policy.
 * e.g., { days: 30, refundPercentage: 100 } means 100% refund if cancelled 30 days or more before the trip.
 */
export interface CancellationRule {
  days: number; // Days before departure
  refundPercentage: number; // Refund percentage (0-100)
}

/**
 * @interface FAQ
 * @description Represents a single Frequently Asked Question for a trip.
 */
export interface FAQ {
    question: string;
    answer: string;
}

/**
 * @interface ItineraryItem
 * @description Represents one day in the trip's itinerary.
 */
export interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    image?: string; // Optional image URL for the day's activities
    imageHint?: string; // AI hint for placeholder
}

/**
 * @interface TripChangeLog
 * @description Represents a single entry in the trip's change log, tracking modifications.
 * BACKEND: This should be its own collection/table (e.g., `tripChangeLogs`)
 */
export interface TripChangeLog {
  id: string;
  timestamp: string; // ISO 8601 format
  changedBy: string; // Could be organizer name or admin name
  section: 'Trip' | 'Batch' | 'Pricing' | 'Policy';
  changeType: 'Created' | 'Edited' | 'Deleted' | 'Status Change';
  remarks: string; // Mandatory reason for the change provided by the organizer/admin
  changedFields: string; // A description of what changed, e.g., "Price: ₹12,500 → ₹14,000"
}

/**
 * @interface Trip
 * @description The main data structure for a travel package.
 * Contains all information an organizer provides and what an admin manages.
 */
export interface Trip {
  id: string;
  slug: string; // URL-friendly version of the title
  title: string;
  location: string; // General display location, e.g., "Himalayas, India"
  city: string; // Specific destination city for filtering, e.g., "Manali"
  tripType: string; // e.g., "Trek", "Adventure", "Workation" // Corresponds to Category name
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Challenging';
  duration: string; // User-facing text, e.g., "3 Days, 2 Nights"
  description: string;
  minAge: number;
  maxAge: number;
  pickupCity: string; // A single city context for all pickup/drop-off points
  pickupPoints: Point[]; // Array of detailed pickup points
  dropoffPoints: Point[]; // Array of detailed drop-off points
  interests?: string[]; // Searchable tags, e.g., ["Hiking", "Photography", "Foodie"]

  category: string; // DEPRECATED: Retained for compatibility, use tripType for primary classification.
  isFeaturedRequest: boolean; // Organizer checks this to request featuring
  
  // --- Pricing ---
  // Stored at trip level, can be overridden by a batch.
  price: number; // Default base price (organizer-defined)
  taxIncluded: boolean; // Flag to indicate if the base price includes tax
  taxPercentage?: number; // Tax percentage if not included in price

  // --- Visuals ---
  image: string; // Cover image URL
  imageHint: string;
  gallery: { url: string; hint: string }[];

  // --- Details ---
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryItem[];
  
  // --- Batches & Policies ---
  batches: TripBatch[];
  cancellationPolicy: string; // User-facing summary text
  cancellationRules: CancellationRule[]; // Structured rules for backend logic
  faqs: FAQ[];

  // --- Metadata & Status ---
  reviews: { id: string; userId: string; rating: number; comment: string }[];
  organizerId: string;
  isFeatured: boolean; // This is set by the Superadmin
  isBannerTrip?: boolean; // Flag to mark this trip for homepage banner carousel
  status: 'Published' | 'Draft' | 'Unlisted' | 'Pending Approval' | 'Rejected'; // Overall trip status
  adminNotes?: string; // Internal notes from admin, e.g., for rejection
  changeLogs?: TripChangeLog[]; // Audit trail of changes
}

/**
 * @interface OrganizerDocument
 * @description Represents a single document uploaded by an organizer for KYC verification.
 */
export interface OrganizerDocument {
  docType: string; // Unique identifier, e.g., 'pan_card', 'business_registration'
  docTitle: string; // User-friendly title, e.g., "Identity Document (PAN/Aadhar)"
  fileUrl?: string; // URL to the uploaded file on a secure server (e.g., S3/Cloudinary)
  uploadedAt?: string; // ISO 8601 format date
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'; // 'Pending' is the initial state
  rejectionReason?: string; // Optional feedback from admin on rejection
}

/**
 * @interface Organizer
 * @description Represents a trip organizer or vendor on the platform.
 * Contains both public-facing info and internal verification data.
 */
export interface Organizer {
  id: string;
  name: string; // Business / Brand Name
  email: string; // Primary contact email for platform communication
  joinDate: string;

  // --- Profile Information ---
  organizerType?: 'Individual' | 'Sole Proprietorship' | 'Private Limited' | 'LLP' | 'Other';
  logo?: string; // URL for the brand logo
  phone?: string;
  address?: string; // Full registered business address
  website?: string; // Optional, public website URL
  experience?: number; // Years of experience
  specializations?: string[]; // e.g., ['Trekking', 'Wildlife', 'Adventure']
  isProfileComplete: boolean; // Flag to check if essential profile info is filled

  // --- Agreement & Emergency Contact Fields ---
  authorizedSignatoryName?: string;
  authorizedSignatoryId?: string;
  emergencyContact?: string;
  
  // --- Financial Information (Admin-only view) ---
  pan?: string;
  gstin?: string;
  bankAccountNumber?: string;
  ifscCode?: string;

  // --- Verification & Status ---
  kycStatus: 'Incomplete' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
  documents: OrganizerDocument[];
  vendorAgreementStatus: 'Not Submitted' | 'Submitted' | 'Verified' | 'Rejected';
}


/**
 * @interface WalletTransaction
 * @description Represents a single transaction in a user's wallet.
 */
export interface WalletTransaction {
  id: string;
  date: string; // ISO 8601 format
  description: string; // e.g., "Referral Bonus", "Used for Booking BK123"
  amount: number; // Can be positive (credit) or negative (debit)
  type: 'Credit' | 'Debit';
  source: 'Referral' | 'Booking' | 'Refund' | 'Admin Adjustment' | 'Promo';
}

/**
 * @interface User
 * @description Represents a regular user (traveler) on the platform.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'Active' | 'Suspended';
  isProfileComplete: boolean; // Backend should set this to true only after all required fields are filled.

  // --- Optional Profile Details ---
  walletBalance: number;
  referralCode: string; // The user's OWN code to share.
  referredBy: string | null; // The ID of the user who referred this user.
  avatar: string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  dateOfBirth?: string; // ISO string: "YYYY-MM-DD"
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Prefer not to say';
  emergencyContact?: string;
  address?: {
      street: string;
      city: string;
      pincode: string;
  };
  interests?: string[];
  travelPreferences?: 'Budget' | 'Mid-range' | 'Luxury';
  marketingOptIn?: boolean;
  walletTransactions?: WalletTransaction[];
}

// DEV_COMMENT: Represents a single traveler in a booking.
export interface Traveler {
    name: string;
    email: string;
    phone: string;
    emergencyName?: string;
    emergencyPhone?: string;
}

/**
 * @interface Booking
 * @description Represents a single booking made by a user for a specific trip batch.
 * This would be a primary table in the database.
 */
export interface Booking {
  id:string;
  tripId: string;
  userId: string;
  batchId: string;
  bookingDate: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending';
  refundStatus?: 'Pending' | 'Processed' | 'None';
  
  // Financial Breakdown
  subtotal: number;
  couponCodeUsed?: string | null;
  couponDiscount?: number;
  walletAmountUsed?: number;
  taxAmount?: number;
  amount: number; // The final amount paid by the user (subtotal - discounts + tax)
  paymentMode?: 'Card' | 'UPI' | 'Wallet' | 'Netbanking';
  transactionId?: string;

  reviewLeft: boolean;
  travelers: Traveler[]; // List of travelers in this booking.
  cancellationReason?: string; // User-provided reason for cancellation
}

/**
 * @interface City
 * @description Represents a city that can be used for trip destinations or pickups.
 * Managed by the Superadmin.
 */
export interface City {
    id: string;
    name: string;
    enabled: boolean; // If false, cannot be selected in forms or filters
}

/**
 * @interface Dispute
 * @description Represents a dispute raised by a user against a booking.
 */
export interface Dispute {
    id: string;
    bookingId: string;
    userId: string;
    organizerId: string;
    reason: string;
    status: 'Open' | 'Resolved' | 'Closed';
    dateReported: string;
}

/**
 * @interface Payout
 * @description Represents a payout record for a trip organizer.
 * This is generated after a trip batch is completed and revenue is calculated.
 */
export interface Payout {
  id: string;
  tripId: string;
  batchId: string;
  organizerId: string;
  totalRevenue: number;
  platformCommission: number;
  netPayout: number;
  status: 'Pending' | 'Paid' | 'Failed';
  requestDate: string;
  paidDate?: string | Date;
  paymentMode?: 'IMPS' | 'NEFT' | 'UPI' | 'Manual';
  utrNumber?: string;
  invoiceUrl?: string;
  notes?: string;
}

/**
 * @interface PromoCode
 * @description Represents a promotional code created by an admin.
 */
export interface PromoCode {
  id: string;
  code: string;
  type: 'Fixed' | 'Percentage';
  value: number;
  usage: number;
  limit: number;
  status: 'Active' | 'Inactive' | 'Expired';
  expiryDate: string; // ISO 8601 format: "YYYY-MM-DD"
}

/**
 * @interface HomeBanner
 * @description Represents a single banner on the homepage carousel.
 */
export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string; // Can be an internal path or external URL
  isActive: boolean;
}

/**
 * @interface AdminNotification
 * @description Represents a system-level notification for admins.
 */
export interface AdminNotification {
  id: string;
  type: 'KYC' | 'Trip' | 'Payout' | 'User' | 'Dispute';
  title: string;
  description: string;
  timestamp: string; // ISO 8601 format
  isRead: boolean;
  link?: string; // Optional deep link to the relevant page
  icon: LucideIcon;
  iconColor: string;
}

/**
 * @interface AuditLog
 * @description Represents a single entry in the admin audit log.
 */
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'Create' | 'Update' | 'Delete' | 'Login' | 'Approve' | 'Reject' | 'Process' | 'Suspend';
  module: string; // e.g., 'Trips', 'Organisers', 'Payouts'
  details: string; // e.g., "Updated trip 'Goa Getaway' (ID: 1)"
  timestamp: string; // ISO 8601 format
}

/**
 * @interface AdminUser
 * @description Represents an administrative user with specific roles and permissions.
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Finance Manager' | 'Support Agent' | 'Operations Manager';
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string; // ISO 8601 format
}

/**
 * @interface UserSession
 * @description Represents the data stored in the user's session cookie.
 * This is a simplified, unified view of an authenticated user, regardless of their role.
 */
export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'Super Admin' | 'Finance Manager' | 'Support Agent' | 'Operations Manager';
  avatar: string;
}


// DEV_COMMENT: Represents a trip category, managed by the admin.
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon; // Icon component for display
  status: 'Active' | 'Inactive';
}

// DEV_COMMENT: Represents a trip interest tag, managed by the admin.
export interface Interest {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}
