import express from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';

const router = express.Router();

router.post('/create', (req, res, next) => {
  (async () => {
    const { tripId, batchId, userId, travelers } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const batch = trip.batches.find(b => b.id === batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Batch not found' });
    }
    if (batch.availableSlots < travelers.length) {
      return res.status(400).json({ message: 'Not enough slots available' });
    }
    const amount = batch.priceOverride ?? trip.price;
    const booking = await Booking.create({ tripId, batchId, userId, travelers, amount, status: 'Pending' });
    res.status(201).json(booking);
  })().catch(next);
});

export default router;
