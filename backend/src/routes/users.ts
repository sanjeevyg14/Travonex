import express from 'express';
import User from '../models/user';
import Booking from '../models/booking';
import Trip from '../models/trip';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt());

// Get profile
router.get('/me/profile', async (req, res, next) => {
  try {
    const user = await User.findById((req as any).authUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update profile
router.put('/me/profile', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate((req as any).authUser.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get bookings for user
router.get('/me/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: (req as any).authUser.id });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Get full trip objects for user's wishlist
router.get('/me/wishlist', async (req, res, next) => {
  try {
    const user = await User.findById((req as any).authUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const trips = await Trip.find({ _id: { $in: user.wishlist } });
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

// Wallet transactions
router.get('/me/wallet-transactions', async (req, res, next) => {
  try {
    const user = await User.findById((req as any).authUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.walletTransactions || []);
  } catch (err) {
    next(err);
  }
});

// Create wallet transaction (credit or debit)
router.post('/me/wallet-transactions', async (req, res, next) => {
  try {
    const user = await User.findById((req as any).authUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount === 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (amount < 0 && user.walletBalance + amount < 0) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.walletBalance += amount;
    user.walletTransactions.push({
      date: new Date(),
      description: req.body.description || 'Wallet adjustment',
      amount,
      type: amount > 0 ? 'Credit' : 'Debit',
      source: 'USER',
    } as any);
    await user.save();

    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    next(err);
  }
});

export default router;
