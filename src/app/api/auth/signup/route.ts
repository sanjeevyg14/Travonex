/**
 * @fileoverview API Route for creating a new user or organizer account.
 * @description This endpoint handles the self-service signup process.
 *
 * @method POST
 * @endpoint /api/auth/signup
 *
 * @body
 * {
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "accountType": "'USER' | 'ORGANIZER'"
 * }
 *
 * @returns
 * - 201 Created: { message: "Account created successfully..." }
 * - 400 Bad Request
 * - 409 Conflict (for duplicate email/phone)
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { users as mockUsers, organizers as mockOrganizers } from '@/lib/mock-data';
import type { User, Organizer } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { name, email, phone, accountType } = await request.json();

    if (!name || !email || !phone || !accountType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicates across both users and organizers
    const emailExists = mockUsers.some(u => u.email === email) || mockOrganizers.some(o => o.email === email);
    const phoneExists = mockUsers.some(u => u.phone === phone) || mockOrganizers.some(o => o.phone === phone);

    if (emailExists) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }
    if (phoneExists) {
      return NextResponse.json({ message: 'An account with this phone number already exists.' }, { status: 409 });
    }

    // Create new account based on type
    if (accountType === 'ORGANIZER') {
      const newOrganizer: Organizer = {
        id: `VND${Math.floor(Math.random() * 900) + 100}`,
        name,
        email,
        phone,
        joinDate: new Date().toISOString().split('T')[0],
        isProfileComplete: false,
        kycStatus: 'Incomplete',
        vendorAgreementStatus: 'Not Submitted',
        documents: [
            { docType: 'id_proof', docTitle: "Identity Document (PAN/Aadhar)", status: 'Pending' },
            { docType: 'address_proof', docTitle: "Address Proof", status: 'Pending' },
            { docType: 'business_registration', docTitle: "Business Registration Proof", status: 'Pending' },
        ],
      };
      mockOrganizers.push(newOrganizer);
    } else { // Default to USER
      const newUser: User = {
        id: `USR${Math.floor(Math.random() * 900) + 100}`,
        name,
        email,
        phone,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        isProfileComplete: false,
        walletBalance: 0,
        referralCode: `${name.split(' ')[0].toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        referredBy: null,
        avatar: `https://placehold.co/128x128.png?text=${name.charAt(0)}`
      };
      mockUsers.push(newUser);
    }

    return NextResponse.json({ message: 'Account created successfully. Please login to continue.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
