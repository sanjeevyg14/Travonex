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

// Get a trip by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const trip = await Trip.findOne({ slug: req.params.slug }).populate('organizer');
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
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

// Update a trip by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedTrip = await Trip.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('organizer');
        if (!updatedTrip) return res.status(404).json({ error: 'Trip not found' });
        res.json(updatedTrip);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a trip by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
        if (!deletedTrip) return res.status(404).json({ error: 'Trip not found' });
        res.json({ message: 'Trip deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
