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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const res = await fetch(`${BACKEND_URL}/api/trips/slug/${params.slug}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

