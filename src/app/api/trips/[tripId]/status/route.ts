import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function PATCH(request: Request, { params }: { params: { tripId: string } }) {
  const res = await fetch(`${BACKEND_URL}/api/trips/${params.tripId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.get('Authorization') || '',
    },
    body: await request.text(),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
