import express from 'express';
import Trip from '../models/Trip.js';

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management
 */

const router = express.Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: List trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: List of trips
 *   post:
 *     summary: Create trip
 *     tags: [Trips]
 *     responses:
 *       201:
 *         description: Created
 */
// Get all trips
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.isBanner === 'true') {
            query.isBannerTrip = true;
        }

        let tripQuery = Trip.find(query).populate('organizer');
        if (req.query.limit && !isNaN(parseInt(req.query.limit))) {
            tripQuery = tripQuery.limit(parseInt(req.query.limit, 10));
        }

        const trips = await tripQuery;
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/trips/slug/{slug}:
 *   get:
 *     summary: Get trip by slug
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A trip
 */

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

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A trip
 *   put:
 *     summary: Update a trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */

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
