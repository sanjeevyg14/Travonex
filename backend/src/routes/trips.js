import express from 'express';
import Trip from '../models/Trip.js';

const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
    try {
        const trips = await Trip.find().populate('organizer');
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single trip by ID
router.get('/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('organizer');
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new trip
router.post('/', async (req, res) => {
    try {
        const trip = new Trip(req.body);
        await trip.save();
        res.status(201).json(trip);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
