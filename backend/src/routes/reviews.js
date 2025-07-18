import express from 'express';
import Review from '../models/Review.js';
import { z } from 'zod';

const router = express.Router();

const reviewSchema = z.object({
  user: z.string().min(1),
  trip: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('user trip');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = reviewSchema.parse(req.body);
    const review = new Review(parsed);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/trip/:tripId', async (req, res) => {
  try {
    const reviews = await Review.find({ trip: req.params.tripId }).populate('user');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
