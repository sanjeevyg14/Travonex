
import { NextResponse } from 'next/server';
import { organizers, trips, bookings, users } from '@/lib/mock-data';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  // In a real app, you would verify the JWT token here.
  // For our mock scenario, we'll parse our simple token "id-role".
  const token = authHeader.split(' ')[1];
  const [organizerId, userRole] = token.split('-');
  
  if (!organizerId || userRole !== 'ORGANIZER') {
       return NextResponse.json({ message: 'Forbidden: Invalid role or token' }, { status: 403 });
  }

  try {
    // --- Database Query Simulation ---
    const organizer = organizers.find(o => o.id === organizerId);
    if (!organizer) {
      return NextResponse.json({ message: 'Organizer not found' }, { status: 404 });
    }

    // This is the main gatekeeper for this endpoint.
    // If an unverified organizer calls this, block them but provide status.
    if (organizer.kycStatus !== 'Verified') {
        return NextResponse.json({ kycStatus: organizer.kycStatus, message: `Your account is not yet verified. Current status: ${organizer.kycStatus}.` }, { status: 403 });
    }

    const organizerTrips = trips.filter(t => t.organizerId === organizerId);
    const organizerTripIds = organizerTrips.map(t => t.id);
    const organizerBookings = bookings.filter(b => organizerTripIds.includes(b.tripId) && b.status !== 'Cancelled');
    
    const totalRevenue = organizerBookings.reduce((acc, b) => acc + b.amount, 0);
    const totalParticipants = organizerBookings.reduce((acc, b) => acc + b.travelers.length, 0);
    const activeTrips = organizerTrips.filter(t => t.status === 'Published').length;

    const recentBookings = organizerBookings.slice(0, 5).map(b => {
        const user = users.find(u => u.id === b.userId);
        const trip = trips.find(t => t.id === b.tripId);
        return {
            id: b.id,
            customerName: user?.name,
            customerEmail: user?.email,
            tripTitle: trip?.title,
            status: b.status,
            amount: b.amount,
        }
    });

    const dashboardData = {
        totalRevenue,
        totalParticipants,
        activeTrips,
        kycStatus: organizer.kycStatus,
        recentBookings,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch organizer dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
