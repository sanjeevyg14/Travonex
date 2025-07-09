import express from 'express';
import Trip from '../models/trip';
import Organizer from '../models/organizer';

const router = express.Router();

// List trips with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { city, category, featured } = req.query as Record<string, string>;
    const query: any = { status: 'Published' };
    if (city) query.city = city;
    if (category) query.tripType = category;
    if (featured) query.isFeatured = featured === 'true';
    const trips = await Trip.find(query);
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

// Get trip by slug with organizer details
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ slug: req.params.slug, status: 'Published' });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const organizer = await Organizer.findById(trip.organizerId);
    res.json({ trip, organizer });
  } catch (err) {
    next(err);
  }
});

export default router;
