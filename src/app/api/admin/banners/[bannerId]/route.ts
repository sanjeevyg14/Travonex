import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { bannerId: string } }) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/banners/${params.bannerId}`;
  try {
    const res = await fetch(backendUrl, { headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to fetch banner details:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { bannerId: string } }) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/banners/${params.bannerId}`;
  try {
    const body = await request.json();
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to update banner:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { bannerId: string } }) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/banners/${params.bannerId}`;
  try {
    const res = await fetch(backendUrl, { method: 'DELETE', headers: { Authorization: auth } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to delete banner:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
