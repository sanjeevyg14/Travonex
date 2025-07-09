import express, { Request, Response, NextFunction } from 'express';
import Trip, { ITripBatch } from '../models/trip';
import Booking from '../models/booking';
import PromoCode from '../models/promoCode';
import User from '../models/user';
import Dispute from '../models/dispute';
import { razorpay } from '../index';
import crypto from 'crypto';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt());

router.post('/create', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const { tripId, batchId, travelers, couponCode, walletAmount } = req.body;
    const userId = (req as any).authUser.id;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const batch = trip.batches.find((b: ITripBatch) => b.id === batchId);
    if (!batch) return res.status(400).json({ message: 'Batch not found' });

    if (batch.availableSlots < travelers.length) {
      return res.status(400).json({ message: 'Not enough slots available' });
    }

    let amount = batch.priceOverride ?? trip.price;
    let couponDiscount = 0;
    if (couponCode) {
      const promo = await PromoCode.findOne({ code: couponCode, status: 'Active' });
      if (!promo || (promo.expiryDate && promo.expiryDate < new Date())) {
        return res.status(400).json({ message: 'Invalid coupon' });
      }
      if (promo.usage >= promo.limit) {
        return res.status(400).json({ message: 'Promo code usage limit reached' });
      }
      couponDiscount =
        promo.type === 'Percentage'
          ? Math.round((amount * promo.value) / 100)
          : promo.value;
      amount -= couponDiscount;
      promo.usage += 1;
      await promo.save();
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

router.post('/payment-callback', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
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

router.post('/:id/cancel', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Cancelled') return res.json({ refundAmount: 0 });

    const trip = await Trip.findById(booking.tripId);
    const batch = trip?.batches.find(b => b.id === booking.batchId);
    const rules = trip?.cancellationRules || [];
    let refund = 0;
    if (batch) {
      const daysBefore = Math.floor(
        (new Date(batch.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const rule = rules
        .sort((a, b) => b.days - a.days)
        .find(r => daysBefore >= r.days);
      refund = rule ? Math.round((booking.amount * rule.refundPercentage) / 100) : 0;
    }

    booking.status = 'Cancelled';
    booking.refundStatus = 'Pending';
    if (req.body.reason) booking.cancellationReason = req.body.reason;
    await booking.save();
    res.json({ refundAmount: refund });
  })().catch(next);
});

router.post('/:id/disputes', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const trip = await Trip.findById(booking.tripId);
    const dispute = await Dispute.create({
      bookingId: booking.id,
      userId: booking.userId,
      organizerId: trip ? trip.organizerId : '',
      reason: req.body.reason,
    });
    res.status(201).json(dispute);
  })().catch(next);
});

export default router;
