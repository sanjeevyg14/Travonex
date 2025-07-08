import express, { Request, Response, NextFunction } from 'express';
import Trip from '../models/trip';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  Trip.find({ status: 'Published' })
    .then(trips => res.json(trips))
    .catch(next);
});

router.get('/slug/:slug', (req: Request, res: Response, next: NextFunction) => {
  Trip.findOne({ slug: req.params.slug, status: 'Published' })
    .then(trip => {
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
      res.json(trip);
    })
    .catch(next);
});

export default router;
