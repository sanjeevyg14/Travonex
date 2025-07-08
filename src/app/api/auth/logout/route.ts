
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST() {
  const res = await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

