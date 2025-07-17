import express from 'express';
import Organizer from '../models/Organizer.js';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Payout from '../models/Payout.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

// Get all organizers
router.get('/', async (req, res) => {
    try {
        const organizers = await Organizer.find();
        res.json(organizers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new organizer
router.post('/', async (req, res) => {
    try {
        const organizer = new Organizer(req.body);
        await organizer.save();
        res.status(201).json(organizer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/organizers/me/dashboard
router.get('/me/dashboard', requireJwt('organizer'), async (req, res) => {
    try {
        const organizerId = req.user.id;
        const organizer = await Organizer.findById(organizerId);
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

        const trips = await Trip.find({ organizer: organizerId }).select('_id title');
        const tripIds = trips.map(t => t._id);
        const bookings = await Booking.find({ trip: { $in: tripIds }, status: { $ne: 'cancelled' } })
            .populate('user', 'name email')
            .populate('trip', 'title price')
            .sort({ createdAt: -1 });

        const totalRevenue = bookings.reduce((acc, b) => acc + (b.trip?.price || 0), 0);
        const recent = bookings.slice(0, 5);
        const recentBookings = recent.map(b => ({
            id: b._id,
            customerName: b.user?.name,
            customerEmail: b.user?.email,
            tripTitle: b.trip?.title,
            status: b.status,
            amount: b.trip?.price || 0,
        }));

        res.json({
            totalRevenue,
            totalBookings: bookings.length,
            activeTrips: trips.length,
            kycStatus: organizer.kycStatus,
            recentBookings,
        });
    } catch (err) {
        console.error('Organizer dashboard error:', err);
        res.status(500).json({ message: 'Failed to fetch organizer dashboard data' });
    }
});

// GET /api/organizers/me/profile
router.get('/me/profile', requireJwt('organizer'), async (req, res) => {
    try {
        const organizer = await Organizer.findById(req.user.id).select('-password');
        if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
        res.json(organizer);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', details: err.message });
    }
});

// PUT /api/organizers/me/profile
router.put('/me/profile', requireJwt('organizer'), async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password;
        const organizer = await Organizer.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
        res.json(organizer);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update profile', details: err.message });
    }
});

// GET /api/organizers/me/trips
router.get('/me/trips', requireJwt('organizer'), async (req, res) => {
    try {
        const trips = await Trip.find({ organizer: req.user.id });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/organizers/me/bookings
router.get('/me/bookings', requireJwt('organizer'), async (req, res) => {
    try {
        const trips = await Trip.find({ organizer: req.user.id }).select('_id');
        const tripIds = trips.map(t => t._id);
        const bookings = await Booking.find({ trip: { $in: tripIds } })
            .populate('user', 'name email')
            .populate('trip', 'title price');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/organizers/me/payout-history

router.get('/me/payout-history', requireJwt('organizer'), async (req, res) => {
    try {
        const payouts = await Payout.find({ organizer: req.user.id })
            .populate('trip', 'title');
        res.json(payouts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/organizers/me/eligible-payouts
router.get('/me/eligible-payouts', requireJwt('organizer'), async (req, res) => {
    try {
        // Placeholder logic: return confirmed bookings as eligible
        const trips = await Trip.find({ organizer: req.user.id }).select('_id title');
        const tripIds = trips.map(t => t._id);
        const bookings = await Booking.find({ trip: { $in: tripIds }, status: 'confirmed' })
            .populate('trip', 'title price');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/organizers/me/payouts/request
router.post('/me/payouts/request', requireJwt('organizer'), async (req, res) => {
    try {
        const { tripId, batchId, totalRevenue, platformCommission, netPayout, notes } = req.body;
        const payout = new Payout({
            trip: tripId,
            batchId,
            organizer: req.user.id,
            totalRevenue,
            platformCommission,
            netPayout,
            status: 'Pending',
            notes,
        });
        await payout.save();
        res.status(201).json(payout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/organizers/me/reviews
router.get('/me/reviews', requireJwt('organizer'), async (req, res) => {
    try {
        res.json([]); // Reviews not implemented in schema
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/organizers/me/notifications
router.get('/me/notifications', requireJwt('organizer'), async (req, res) => {
    try {
        res.json([]); // Placeholder for future notifications
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
