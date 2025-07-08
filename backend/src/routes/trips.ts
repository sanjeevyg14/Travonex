import express, { Request, Response, NextFunction } from 'express';
import Trip from '../models/trip';
import Organizer from '../models/organizer';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  Trip.find({ status: 'Published' })
    .then(trips => res.json(trips))
    .catch(next);
});

router.get('/slug/:slug', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const trip = await Trip.findOne({ slug: req.params.slug, status: 'Published' });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const organizer = await Organizer.findById(trip.organizerId);
    res.json({ trip, organizer });
  })().catch(next);
});

export default router;
