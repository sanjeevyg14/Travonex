
/**
 * @fileoverview API Route for user, organizer, and admin login.
 * @description This endpoint handles authentication for all roles.
 *
 * @method POST
 * @endpoint /api/auth/login
 *
 * @body
 * {
 *   "identifier": "string (phone number or email)",
 *   "credential": "string (OTP or password)"
 * }
 *
 * @returns
 * - 200 OK: { user: UserSession, token: string, redirectPath: string }
 * - 401 Unauthorized: { message: "Invalid credentials" }
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { adminUsers, users as mockUsers, organizers as mockOrganizers } from '@/lib/mock-data';
import type { UserSession } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { identifier, credential } = await request.json();

    if (!identifier || !credential) {
      return NextResponse.json({ message: 'Identifier and credential are required' }, { status: 400 });
    }
    
    const isEmail = identifier.includes('@');
    let sessionData: UserSession | null = null;
    let redirectPath = '/';

    if (isEmail) {
      // --- Handle Admin Login ---
      const admin = adminUsers.find(admin => admin.email === identifier);
      
      if (!admin) {
        return NextResponse.json({ message: 'Admin account not found.' }, { status: 401 });
      }
      if (admin.status !== 'Active') {
        return NextResponse.json({ message: `Admin account is ${admin.status}. Please contact support.` }, { status: 403 });
      }
      if (credential !== 'password') { // Mock password check
        return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
      }
      
      sessionData = { 
          id: admin.id, 
          name: admin.name, 
          email: admin.email, 
          role: admin.role, 
          avatar: `https://placehold.co/40x40.png?text=${admin.name.charAt(0)}` 
      };
      
      redirectPath = '/admin/dashboard';
      
    } else {
      // --- Handle User/Organizer OTP Login ---
      if (credential !== '123456') { // Mock OTP check
        return NextResponse.json({ message: 'Invalid OTP.' }, { status: 401 });
      }
      
      const organizer = mockOrganizers.find(o => o.phone === identifier);
      if (organizer) {
        // --- STABLE V1.1.0 LOGIC ---
        // Allow organizer to log in, but redirect based on verification status.
        sessionData = { 
            id: organizer.id, 
            name: organizer.name, 
            email: organizer.email, 
            role: 'ORGANIZER', 
            avatar: `https://placehold.co/40x40.png?text=${organizer.name.charAt(0)}` 
        };
        
        if (organizer.kycStatus === 'Verified') {
            redirectPath = '/trip-organiser/dashboard';
        } else {
            // For 'Incomplete', 'Pending', 'Rejected', or 'Suspended' statuses, send to profile page.
            redirectPath = '/trip-organiser/profile';
        }
      } else {
        const regularUser = mockUsers.find(u => u.phone === identifier);
        if (regularUser) {
          sessionData = { id: regularUser.id, name: regularUser.name, email: regularUser.email, role: 'USER', avatar: regularUser.avatar };
          redirectPath = '/';
        }
      }
    }
    
    if (sessionData) {
      // Create a mock token for the session. In a real app, this would be a signed JWT.
      const token = `${sessionData.id}-${sessionData.role.replace(/ /g, '_')}`;
      
      const response = NextResponse.json({ user: sessionData, token, redirectPath });

      // Set a cookie for server-side component access
      response.cookies.set({
          name: 'userSession',
          value: JSON.stringify(sessionData),
          httpOnly: true, // Recommended for security
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      response.cookies.set({
          name: 'authToken',
          value: token,
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    } else {
      return NextResponse.json({ message: 'User or Organizer account not found.' }, { status: 404 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
