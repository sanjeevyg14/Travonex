import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { organizerId: string } }) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/organizers/${params.organizerId}/status`;
  try {
    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: await request.text(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to update organizer status:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
