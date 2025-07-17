/**
 * @fileoverview API Route for fetching multiple trips.
 * @description This public endpoint serves trips for the homepage and search page.
 *
 * @method GET
 * @endpoint /api/trips
 *
 * @query_params
 * - `q`: string (for search)
 * - `isFeatured`: boolean
 * - `isBanner`: boolean
 * - `city`: string
 * - `category`: string
 * - `limit`: number
 *
 * @returns
 * - 200 OK: Trip[]
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import type { Trip } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips`;
    const url = new URL(backendUrl);
    searchParams.forEach((value, key) => url.searchParams.append(key, value));

    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json({ message: 'An error occurred while fetching trips.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json({ message: 'An error occurred while creating trip.' }, { status: 500 });
  }
}
