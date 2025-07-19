import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { tripId: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/reviews/trip/${params.tripId}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to fetch reviews for trip ${params.tripId}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
