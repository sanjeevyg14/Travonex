import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips/${params.id}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json({ message: 'An error occurred while fetching trip.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips/${params.id}`;
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to update trip:', error);
    return NextResponse.json({ message: 'An error occurred while updating trip.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips/${params.id}`;
    const res = await fetch(backendUrl, { method: 'DELETE' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    return NextResponse.json({ message: 'An error occurred while deleting trip.' }, { status: 500 });
  }
}
