/**
 * @fileoverview API Route for fetching a single trip by its slug.
 * @description This public endpoint serves a single trip for the trip details page.
 *
 * @method GET
 * @endpoint /api/trips/slug/{slug}
 *
 * @returns
 * - 200 OK: Trip
 * - 404 Not Found
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/trips/slug/${params.slug}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error(`Failed to fetch trip ${params.slug}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
