
/**
 * @fileoverview API Route for user, organizer, and admin login.
 * @description This endpoint handles authentication for all roles.
 *
 * @method POST
 * @endpoint /api/auth/login
 *
 * @body
 * {
 *   "email": "string",
 *   "password": "string"
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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let sessionData: UserSession | null = null;
    let redirectPath = '/';

    const admin = adminUsers.find(admin => admin.email === email);
    if (admin) {
      if (admin.status !== 'Active') {
        return NextResponse.json({ message: `Admin account is ${admin.status}. Please contact support.` }, { status: 403 });
      }
      if (password !== 'password') {
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
      const organizer = mockOrganizers.find(o => o.email === email);
      if (organizer && password === 'password') {
        sessionData = {
          id: organizer.id,
          name: organizer.name,
          email: organizer.email,
          role: 'ORGANIZER',
          avatar: `https://placehold.co/40x40.png?text=${organizer.name.charAt(0)}`
        };
        redirectPath = organizer.kycStatus === 'Verified' ? '/trip-organiser/dashboard' : '/trip-organiser/profile';
      } else {
        const regularUser = mockUsers.find(u => u.email === email);
        if (regularUser && password === 'password') {
          sessionData = {
            id: regularUser.id,
            name: regularUser.name,
            email: regularUser.email,
            role: 'USER',
            avatar: regularUser.avatar
          };
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
