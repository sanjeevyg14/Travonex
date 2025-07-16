
import { NextResponse } from 'next/server';
import { adminUsers, users as mockUsers, organizers as mockOrganizers, trips as mockTrips, bookings as mockBookings, payouts as mockPayouts, disputes as mockDisputes } from '@/lib/mock-data';
import type { UserSession } from '@/lib/types';

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
    // --- Database Query Simulation ---
    // These would be efficient aggregate queries in a real database.
    const totalRevenue = mockBookings.filter(b => b.status !== 'Cancelled').reduce((acc, b) => acc + b.amount, 0);
    const pendingKycs = mockOrganizers.filter(o => o.kycStatus === 'Pending' || o.vendorAgreementStatus === 'Submitted').length;
    const pendingTrips = mockTrips.filter(t => t.status === 'Pending Approval').length;
    const pendingPayouts = mockPayouts.filter(p => p.status === 'Pending').length;
    const pendingDisputes = mockDisputes.filter(d => d.status === 'Open').length;

    const recentBookings = mockBookings.slice(0, 5).map(booking => {
        const user = mockUsers.find(u => u.id === booking.userId);
        const trip = mockTrips.find(t => t.id === booking.tripId);
        return {
            id: booking.id,
            userName: user?.name,
            tripTitle: trip?.title,
            bookingDate: booking.bookingDate,
            amount: booking.amount,
        }
    });

    const dashboardData = {
        totalRevenue,
        totalUsers: mockUsers.length,
        totalOrganizers: mockOrganizers.length,
        totalBookings: mockBookings.length,
        pendingKycs,
        pendingTrips,
        pendingPayouts,
        pendingDisputes,
        totalPending: pendingKycs + pendingTrips + pendingPayouts + pendingDisputes,
        recentBookings,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch admin dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
