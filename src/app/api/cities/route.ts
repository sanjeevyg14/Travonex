import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/cities`;
    const url = new URL(backendUrl);
    searchParams.forEach((value, key) => url.searchParams.append(key, value));
    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return NextResponse.json({ message: 'An error occurred while fetching cities.' }, { status: 500 });
  }
}
