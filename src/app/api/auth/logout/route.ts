
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the session cookies by setting their expiration date to the past.
    response.cookies.set({
      name: 'userSession',
      value: '',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set({
      name: 'authToken',
      value: '',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
