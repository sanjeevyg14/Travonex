import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

// GET /api/banners - list active banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
