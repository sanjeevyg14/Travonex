import express from 'express';
import User from '../models/user';
import Booking from '../models/booking';
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

// Placeholder wishlist endpoint
router.get('/me/wishlist', async (_req, res) => {
  res.json([]);
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

export default router;
