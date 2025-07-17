import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/organizers/me/payout-history`;
    const res = await fetch(backendUrl, { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch payout history:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
