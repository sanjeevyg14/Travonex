import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/bookings`;
  try {
    const res = await fetch(backendUrl, { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
