import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/organizers/me/payouts/request`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to request payout:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
