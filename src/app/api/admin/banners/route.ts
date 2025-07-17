import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/banners`;
  try {
    const res = await fetch(backendUrl, { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to fetch banners:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/banners`;
  try {
    const body = await request.json();
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to create banner:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
