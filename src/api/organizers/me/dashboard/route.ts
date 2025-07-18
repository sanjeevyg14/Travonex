
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  // In a real app, you would verify the JWT token here.
  // For our mock scenario, we'll parse our simple token "id-role".
  const token = authHeader.split(' ')[1];
  const [organizerId, userRole] = token.split('-');
  
  if (!organizerId || userRole !== 'ORGANIZER') {
       return NextResponse.json({ message: 'Forbidden: Invalid role or token' }, { status: 403 });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/organizers/me/dashboard`;
    const res = await fetch(backendUrl, { headers: { Authorization: authHeader } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch organizer dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
