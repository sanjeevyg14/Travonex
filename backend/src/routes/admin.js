import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

router.get('/dashboard', requireJwt('admin'), async (req, res) => {
  try {
    const [totalUsers, totalOrganizers, totalBookings] = await Promise.all([
      User.countDocuments(),
      Organizer.countDocuments(),
      Booking.countDocuments(),
    ]);

    const bookings = await Booking.find({ status: { $ne: 'cancelled' } })
      .populate('trip', 'price')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const totalRevenue = bookings.reduce((acc, b) => acc + (b.trip?.price || 0), 0);
    const recent = bookings.slice(0, 5);
    const recentBookings = recent.map(b => ({
      id: b._id,
      userName: b.user?.name,
      tripTitle: b.trip?.title,
      bookingDate: b.createdAt,
      amount: b.trip?.price || 0,
    }));

    const pendingKycs = await Organizer.countDocuments({
      $or: [
        { kycStatus: { $ne: 'Verified' } },
        { vendorAgreementStatus: { $ne: 'Verified' } },
      ],
    });

    res.json({
      totalRevenue,
      totalUsers,
      totalOrganizers,
      totalBookings,
      pendingKycs,
      pendingTrips: 0,
      pendingPayouts: 0,
      pendingDisputes: 0,
      totalPending: pendingKycs,
      recentBookings,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

export default router;
