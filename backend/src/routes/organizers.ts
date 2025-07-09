import express from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';
import Payout from '../models/payout';
import Review from '../models/review';
import Notification from '../models/notification';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ORGANIZER'));

// Dashboard summary
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

// Payout history
router.get('/payouts', async (req, res, next) => {
  try {
    const payouts = await Payout.find({ organizerId: (req as any).authUser.id });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

// Reviews list
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ organizerId: (req as any).authUser.id });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// ----- Notifications -----
router.get('/notifications', (req, res, next) => {
  Notification.find({ userId: (req as any).authUser.id })
    .then(n => res.json(n))
    .catch(next);
});

router.post('/notifications/:id/read', (req, res, next) => {
  Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })
    .then(n => {
      if (!n) return res.status(404).json({ message: 'Notification not found' });
      try {
        const { getIO } = require('../socket');
        getIO().to(n.userId).emit('notification-read', n);
      } catch {}
      res.json(n);
    })
    .catch(next);
});

export default router;
