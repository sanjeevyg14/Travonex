import express from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';
import Payout from '../models/payout';
import Review from '../models/review';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ORGANIZER'));

// Organizer dashboard summary
router.get('/dashboard', async (req, res, next) => {
  try {
    const trips = await Trip.find({ organizerId: (req as any).authUser.id });
    const tripIds = trips.map(t => t.id);
    const bookings = await Booking.find({ tripId: { $in: tripIds }, status: { $in: ['Confirmed', 'Completed'] } });
    const revenue = bookings.reduce((acc, b) => acc + (b.amount || 0), 0);
    const participants = bookings.reduce((acc, b) => acc + (b.travelers?.length || 0), 0);
    const pending = await Booking.countDocuments({ tripId: { $in: tripIds }, status: 'Pending' });
    res.json({ revenue, participants, pendingBookings: pending });
  } catch (err) {
    next(err);
  }
});

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
    const data = {
      ...req.body,
      organizerId: (req as any).authUser.id,
      batches: (req.body.batches || []).map((b: any) => ({
        ...b,
        availableSlots: b.availableSlots ?? b.maxParticipants,
      })),
    };
    const trip = await Trip.create(data);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

router.put('/trips/:id', async (req, res, next) => {
  try {
    const update: any = { ...req.body };
    if (update.batches) {
      update.batches = update.batches.map((b: any) => ({
        ...b,
        availableSlots: b.availableSlots ?? b.maxParticipants,
      }));
    }
    const trip = await Trip.findOneAndUpdate({ _id: req.params.id, organizerId: (req as any).authUser.id }, update, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

router.patch('/trips/:id/status', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, organizerId: (req as any).authUser.id },
      { status: req.body.status },
      { new: true }
    );
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
    const tripMap: any = {};
    trips.forEach(t => (tripMap[t.id] = t));
    const bookings = await Booking.find({ tripId: { $in: tripIds } });
    const results = bookings.map(b => ({ ...b.toObject(), trip: tripMap[b.tripId] }));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ organizerId: (req as any).authUser.id });
    const tripIds = reviews.map(r => r.tripId);
    const trips = await Trip.find({ _id: { $in: tripIds } });
    const map: any = {};
    trips.forEach(t => (map[t.id] = t.title));
    const results = reviews.map(r => ({ ...r.toObject(), tripTitle: map[r.tripId] }));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/eligible-payouts', async (req, res, next) => {
  try {
    const payouts = await Payout.find({ organizerId: (req as any).authUser.id, status: 'Pending' });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

router.get('/payout-history', async (req, res, next) => {
  try {
    const payouts = await Payout.find({ organizerId: (req as any).authUser.id });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

router.post('/payouts/request', async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      organizerId: (req as any).authUser.id,
      status: 'Pending',
      requestDate: new Date(),
    };
    const payout = await Payout.create(data);
    res.status(201).json(payout);
  } catch (err) {
    next(err);
  }
});

export default router;
