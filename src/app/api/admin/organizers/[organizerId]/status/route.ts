import { NextResponse, NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function PATCH(request: NextRequest, context: { params: { organizerId: string } }) {
  const { params } = context;
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/admin/organizers/${params.organizerId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.get('Authorization') || '',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

