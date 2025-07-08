
/**
 * @fileoverview API Route for updating an organizer's KYC status.
 * @description This is a protected endpoint for admins only.
 *
 * @method PATCH
 * @endpoint /api/admin/organizers/{organizerId}/status
 *
 * @body
 * {
 *   "kycStatus": "'Verified' | 'Rejected' | 'Suspended' | 'Pending'"
 * }
 *
 * @returns
 * - 200 OK: { message: "Status updated" }
 * - 400 Bad Request
 * - 401 Unauthorized / 403 Forbidden
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { organizers, adminUsers } from '@/lib/mock-data';
import type { UserSession } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { organizerId: string } }
) {
  // --- Authentication & Authorization Check ---
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const [userId, userRole] = token.split('-');
    
    // In a real app, you'd verify the JWT token and get the user's role from its payload.
    // Here, we simulate that by checking the role from our mock token.
    const allowedRoles = ['Super_Admin', 'Operations_Manager'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }
    
    const admin = adminUsers.find(u => u.id === userId);
    if (!admin) {
        return NextResponse.json({ message: 'Forbidden: Admin user not found' }, { status: 403 });
    }
    // --- End Check ---

    const { organizerId } = params;
    const { kycStatus } = await request.json();

    if (!kycStatus || !['Verified', 'Rejected', 'Suspended', 'Pending'].includes(kycStatus)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    // --- Database Update Simulation ---
    const organizerIndex = organizers.findIndex(o => o.id === organizerId);
    if (organizerIndex === -1) {
      return NextResponse.json({ message: 'Organizer not found' }, { status: 404 });
    }

    // This is where you would update the record in your database.
    // e.g., db.organizers.update({ where: { id: organizerId }, data: { kycStatus } });
    organizers[organizerIndex].kycStatus = kycStatus;

    // You should also create an audit log entry for this action.
    console.log(`Admin ${admin.name} (${admin.id}) changed organizer ${organizerId} status to ${kycStatus}`);
    // --- End of Database Update Simulation ---

    return NextResponse.json({ message: 'Organizer status updated successfully' });

  } catch (error) {
    console.error(`Failed to update organizer status for ${params.organizerId}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
