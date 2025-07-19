/**
 * @fileoverview API Route for creating a new user or organizer account.
 * @description This endpoint handles the self-service signup process.
 *
 * @method POST
 * @endpoint /api/auth/signup
 *
 * @body
 * {
 *   "idToken": "string",
 *   "name": "string",
 *   "email": "string",
 *   "role": "'USER' | 'ORGANIZER'"
 * }
 *
 * @returns
 * - 201 Created: { message: "Account created successfully..." }
 * - 400 Bad Request
 * - 409 Conflict (for duplicate email/phone)
 * - 500 Internal Server Error
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
