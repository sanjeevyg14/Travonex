import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings`;
    const url = new URL(backendUrl);
    searchParams.forEach((value, key) => url.searchParams.append(key, value));
    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ message: 'An error occurred while fetching bookings.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ message: 'An error occurred while creating booking.' }, { status: 500 });
  }
}
