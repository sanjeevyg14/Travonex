import express from 'express';
import Coupon from '../models/coupon';

const router = express.Router();

router.post('/validate', async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code required' });
    }
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon' });
    }
    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
