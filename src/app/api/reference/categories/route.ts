import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const res = await fetch(`${BACKEND_URL}/api/reference/categories${search}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
