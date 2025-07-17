import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import Payout from '../models/Payout.js';
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

// --- Additional Admin Management Endpoints ---

// Users list
router.get('/users', requireJwt('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Organizers list
router.get('/organizers', requireJwt('admin'), async (req, res) => {
  try {
    const organizers = await Organizer.find();
    res.json(organizers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Organizer details
router.get('/organizers/:id', requireJwt('admin'), async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json(organizer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update organizer verification status
router.patch('/organizers/:id/status', requireJwt('admin'), async (req, res) => {
  try {
    const { kycStatus, vendorAgreementStatus } = req.body;
    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      { kycStatus, vendorAgreementStatus },
      { new: true, runValidators: true }
    );
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json({ message: 'Status updated', organizer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Bookings list
router.get('/bookings', requireJwt('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user trip');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Booking details
router.get('/bookings/:id', requireJwt('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user trip');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Payouts list
router.get('/payouts', requireJwt('admin'), async (req, res) => {
  try {
    const payouts = await Payout.find().populate('trip organizer');
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Process payout
router.post('/payouts/:id/process', requireJwt('admin'), async (req, res) => {
  try {
    const { paymentMode, utrNumber, paidDate, notes } = req.body;
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { paymentMode, utrNumber, paidDate, notes, status: 'Paid' },
      { new: true, runValidators: true }
    ).populate('trip organizer');
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
