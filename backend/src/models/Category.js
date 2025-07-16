import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const categorySchema = new mongoose.Schema({
    name: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
});

export default mongoose.model('Category', categorySchema);

export async function GET() {
    // Fetch categories from backend
    const res = await fetch(`${BACKEND_URL}/api/categories`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    // Create category in backend
    const res = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
