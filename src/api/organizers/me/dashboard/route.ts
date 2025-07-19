
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization') || '';

  if (!authHeader) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/organizers/me/dashboard`;
    const res = await fetch(backendUrl, { headers: { Authorization: authHeader } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
    const backendRes = await fetch(backendUrl, { headers: { Authorization: authHeader } });
    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch organizer dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
