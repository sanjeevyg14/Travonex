import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user trip');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bookings for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId }).populate('user trip');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Handler for creating a booking
const createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Create a new booking
router.post('/', createBooking);

// Preferred create endpoint
router.post('/create', createBooking);

// Get a booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('user trip');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a booking by ID
router.put('/:id', async (req, res) => {
    try {
        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user trip');
        if (!updated) return res.status(404).json({ error: 'Booking not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cancel a booking
router.post('/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        booking.status = 'cancelled';
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a booking by ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Booking.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
