import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/users/me/profile`;
    const res = await fetch(backendUrl, { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/users/me/profile`;
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
