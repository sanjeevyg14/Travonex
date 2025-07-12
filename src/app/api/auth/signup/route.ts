/**
 * @fileoverview API Route for creating a new user or organizer account.
 * @description This endpoint handles the self-service signup process.
 *
 * @method POST
 * @endpoint /api/auth/signup
 *
 * @body
 * {
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "accountType": "'USER' | 'ORGANIZER'",
 *   "idToken": "string"
 * }
 *
 * @returns
 * - 201 Created: { message: "Account created successfully..." }
 * - 400 Bad Request
 * - 409 Conflict (for duplicate email/phone)
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

