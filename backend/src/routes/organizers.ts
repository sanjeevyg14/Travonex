import express, { Request, Response, NextFunction } from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';
import Payout from '../models/payout';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ORGANIZER'));

router.get('/trips', (req: Request, res: Response, next: NextFunction) => {
  Trip.find({ organizerId: (req as any).authUser.id })
    .then(trips => res.json(trips))
    .catch(next);
});

router.post('/trips', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const data = { ...req.body, organizerId: (req as any).authUser.id };
    const trip = await Trip.create(data);
    res.status(201).json(trip);
  })().catch(next);
});

router.put('/trips/:id', (req: Request, res: Response, next: NextFunction) => {
  Trip.findOneAndUpdate({ _id: req.params.id, organizerId: (req as any).authUser.id }, req.body, { new: true })
    .then(trip => {
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      res.json(trip);
    })
    .catch(next);
});

router.delete('/trips/:id', (req: Request, res: Response, next: NextFunction) => {
  Trip.findOneAndDelete({ _id: req.params.id, organizerId: (req as any).authUser.id })
    .then(trip => {
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      res.json({ success: true });
    })
    .catch(next);
});

router.get('/bookings', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const trips = await Trip.find({ organizerId: (req as any).authUser.id });
    const tripIds = trips.map(t => t.id);
    const bookings = await Booking.find({ tripId: { $in: tripIds } });
    res.json(bookings);
  })().catch(next);
});

router.get('/payouts', (req: Request, res: Response, next: NextFunction) => {
  Payout.find({ organizerId: (req as any).authUser.id })
    .then(payouts => res.json(payouts))
    .catch(next);
});

export default router;
