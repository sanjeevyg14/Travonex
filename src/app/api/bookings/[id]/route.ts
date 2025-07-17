import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/${params.id}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to fetch booking ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching booking.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/${params.id}`;
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to update booking ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while updating booking.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/${params.id}`;
    const res = await fetch(backendUrl, { method: 'DELETE' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Failed to delete booking ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while deleting booking.' }, { status: 500 });
  }
}
