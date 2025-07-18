import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Validate coupon code
router.post('/validate', async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code });
  if (!coupon || coupon.expiresAt < new Date()) {
    return res.status(404).json({ message: 'Invalid coupon' });
  }
  res.json({ discount: coupon.discount });
});

export default router;
