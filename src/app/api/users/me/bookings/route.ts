import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  const cookie = cookies().get('authToken');
  const res = await fetch(`${BACKEND_URL}/api/users/me/bookings`, {
    headers: { Authorization: cookie ? `Bearer ${cookie.value}` : '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

