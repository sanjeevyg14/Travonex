import express from 'express';
import Organizer from '../models/Organizer.js';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
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

export default router;
