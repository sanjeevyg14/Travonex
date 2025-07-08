import express from 'express';
import Trip from '../models/trip';
import Booking from '../models/booking';
import Coupon from '../models/coupon';
import User from '../models/user';
import { razorpay } from '../index';
import crypto from 'crypto';

const router = express.Router();

router.post('/create', (req, res, next) => {
  (async () => {
    const { tripId, batchId, userId, travelers, couponCode, walletAmount } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const batch = trip.batches.find(b => b.id === batchId);
    if (!batch) return res.status(400).json({ message: 'Batch not found' });

    if (batch.availableSlots < travelers.length) {
      return res.status(400).json({ message: 'Not enough slots available' });
    }

    let amount = batch.priceOverride ?? trip.price;
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon' });
      couponDiscount = coupon.discountType === 'percent' ? Math.round((amount * coupon.discountValue) / 100) : coupon.discountValue;
      amount -= couponDiscount;
    }

    let walletUsed = 0;
    if (walletAmount) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      walletUsed = Math.min(walletAmount, user.walletBalance, amount);
      user.walletBalance -= walletUsed;
      await user.save();
      amount -= walletUsed;
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `trip_${tripId}_${Date.now()}`,
    });

    const booking = await Booking.create({
      tripId,
      batchId,
      userId,
      travelers,
      amount,
      couponCodeUsed: couponCode,
      couponDiscount,
      walletAmountUsed: walletUsed,
      razorpayOrderId: razorpayOrder.id,
      status: 'Pending',
    });

    res.status(201).json({ bookingId: booking.id, razorpayOrder });
  })().catch(next);
});

router.post('/payment-callback', (req, res, next) => {
  (async () => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'Confirmed';
    booking.transactionId = razorpay_payment_id;
    await booking.save();

    const trip = await Trip.findById(booking.tripId);
    if (trip) {
      const batch = trip.batches.find(b => b.id === booking.batchId);
      if (batch) {
        batch.availableSlots -= booking.travelers.length;
        if (batch.availableSlots < 0) batch.availableSlots = 0;
      }
      await trip.save();
    }

    res.json({ success: true });
  })().catch(next);
});

export default router;
