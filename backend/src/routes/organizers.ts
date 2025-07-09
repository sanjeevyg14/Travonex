import express from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';
import Payout from '../models/payout';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ORGANIZER'));

// Organizer trips CRUD
router.get('/trips', async (req, res, next) => {
  try {
    const trips = await Trip.find({ organizerId: (req as any).authUser.id });
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

router.post('/trips', async (req, res, next) => {
  try {
    const data = { ...req.body, organizerId: (req as any).authUser.id };
    const trip = await Trip.create(data);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

router.put('/trips/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate({ _id: req.params.id, organizerId: (req as any).authUser.id }, req.body, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

router.delete('/trips/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, organizerId: (req as any).authUser.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const trips = await Trip.find({ organizerId: (req as any).authUser.id });
    const tripIds = trips.map(t => t.id);
    const bookings = await Booking.find({ tripId: { $in: tripIds } });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/payouts', async (req, res, next) => {
  try {
    const payouts = await Payout.find({ organizerId: (req as any).authUser.id });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

export default router;
