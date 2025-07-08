
/**
 * @fileoverview API Route for user, organizer, and admin login.
 * @description This endpoint handles authentication for all roles.
 *
 * @method POST
 * @endpoint /api/auth/login
 *
 * @body
 * {
 *   "identifier": "string (phone number or email)",
 *   "credential": "string (OTP or password)"
 * }
 *
 * @returns
 * - 200 OK: { user: UserSession, token: string, redirectPath: string }
 * - 401 Unauthorized: { message: "Invalid credentials" }
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

