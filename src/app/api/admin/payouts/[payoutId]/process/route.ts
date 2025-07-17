import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { payoutId: string } }) {
  const auth = request.headers.get('Authorization') || '';
  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/payouts/${params.payoutId}/process`;
  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: await request.text(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Failed to process payout:', err);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
