import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  const { searchParams } = new URL(request.url);
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/interests`;
    const url = new URL(backendUrl);
    searchParams.forEach((v, k) => url.searchParams.append(k, v));
    const res = await fetch(url.toString(), { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to fetch interests:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/interests`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to create interest:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'Interest id required' }, { status: 400 });
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/interests/${id}`;
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to update interest:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
