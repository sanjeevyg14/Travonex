import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/otp-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error('OTP signup error:', err);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
