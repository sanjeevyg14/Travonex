import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/user/${params.userId}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to fetch bookings for user ${params.userId}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching user bookings.' }, { status: 500 });
  }
}
