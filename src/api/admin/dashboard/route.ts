
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // In a real app, you would verify the JWT token here.
  // For our mock scenario, we'll parse our simple token "id-role".
  const token = authHeader.split(' ')[1];
  const [userId, userRole] = token.split('-');

  // The token contains roles with underscores (e.g., "Super_Admin").
  // This check ensures the role from the token matches the expected format.
  const allowedRoles = [
      'Super_Admin',
      'Finance_Manager',
      'Operations_Manager',
      'Support_Agent',
  ];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  // --- End Check ---

  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/dashboard`;
    const res = await fetch(backendUrl, { headers: { Authorization: authHeader } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch admin dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
