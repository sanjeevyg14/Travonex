import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });
    if (backendRes.ok && data.user && data.token) {
      response.cookies.set({
        name: 'userSession',
        value: JSON.stringify(data.user),
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set({
        name: 'authToken',
        value: data.token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
