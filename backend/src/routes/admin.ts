import express, { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking';
import Payout from '../models/payout';
import User from '../models/user';
import Organizer from '../models/organizer';
import Trip from '../models/trip';
import Dispute from '../models/dispute';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ADMIN'));

router.get('/dashboard', (_req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const bookings = await Booking.countDocuments();
    const payouts = await Payout.countDocuments();
    const users = await User.countDocuments();
    const organizers = await Organizer.countDocuments();
    res.json({ bookings, payouts, users, organizers });
  })().catch(next);
});

router.patch('/organizers/:id/status', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const organizer = await Organizer.findByIdAndUpdate(req.params.id, { kycStatus: req.body.status }, { new: true });
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json(organizer);
  })().catch(next);
});

router.get('/disputes', (_req: Request, res: Response, next: NextFunction) => {
  Dispute.find()
    .then(disputes => res.json(disputes))
    .catch(next);
});

router.patch('/disputes/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json(dispute);
  })().catch(next);
});

router.post('/payouts/:id/process', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paidDate: new Date(), paymentMode: req.body.paymentMode },
      { new: true }
    );
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  })().catch(next);
});

export default router;
