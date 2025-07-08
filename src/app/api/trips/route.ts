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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const url = `${BACKEND_URL}/api/trips${search}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

