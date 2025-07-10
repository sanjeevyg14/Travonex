import express from 'express';
import multer from 'multer';
import Trip from '../models/trip';
import Organizer from '../models/organizer';
import { verifyJwt } from '../middleware/verifyJwt';
import { uploadFile } from '../services/upload';

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

// List trips with optional filters
router.get('/', async (req, res, next) => {
  try {
    const {
      city,
      category,
      featured,
      q,
      priceMin,
      priceMax,
      start,
      end,
      organizer,
      rating,
    } = req.query as Record<string, string>;

    const query: any = { status: 'Published' };
    if (city) query.city = city;
    if (category) query.tripType = category;
    if (featured) query.isFeatured = featured === 'true';
    if (organizer) query.organizerId = organizer;

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { title: regex },
        { location: regex },
        { interests: regex },
      ];
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    if (start || end) {
      query.batches = { $elemMatch: {} };
      if (start) (query.batches.$elemMatch as any).endDate = { $gte: start };
      if (end) (query.batches.$elemMatch as any).startDate = { $lte: end };
    }

    let trips = await Trip.find(query);

    if (rating) {
      const minRating = Number(rating);
      trips = trips.filter(t => {
        if (!t.reviews || t.reviews.length === 0) return false;
        const avg =
          t.reviews.reduce((acc, r) => acc + r.rating, 0) / t.reviews.length;
        return avg >= minRating;
      });
    }

    res.json(trips);
  } catch (err) {
    next(err);
  }
});

// Create a trip (organizer)
router.post('/', verifyJwt('ORGANIZER'), upload.single('image'), async (req, res, next) => {
  try {
    const data: any = {
      ...req.body,
      organizerId: (req as any).authUser.id,
      batches: (req.body.batches || []).map((b: any) => ({
        ...b,
        availableSlots: b.availableSlots ?? b.maxParticipants,
      })),
    };
    if (req.file) data.image = await uploadFile(req.file);
    const trip = await Trip.create(data);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

// Update a trip (organizer)
router.put('/:id', verifyJwt('ORGANIZER'), upload.single('image'), async (req, res, next) => {
  try {
    const update: any = { ...req.body };
    if (update.batches) {
      update.batches = update.batches.map((b: any) => ({
        ...b,
        availableSlots: b.availableSlots ?? b.maxParticipants,
      }));
    }
    if (req.file) update.image = await uploadFile(req.file);
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, organizerId: (req as any).authUser.id },
      update,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// Update trip status
router.patch('/:id/status', verifyJwt('ORGANIZER'), async (req, res, next) => {
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
