import express from 'express';
import User from '../models/User.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *   post:
 *     summary: Create user
 *     tags: [Users]
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 */
router.get('/me/profile', requireJwt('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', details: err.message });
    }
});

// GET /api/users/me/wallet-transactions
router.get('/me/wallet-transactions', requireJwt('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletTransactions');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.walletTransactions || []);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch wallet transactions', details: err.message });
    }
});

// GET /api/users/me/wishlist
router.get('/me/wishlist', requireJwt('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('wishlist');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.wishlist || []);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch wishlist', details: err.message });
    }
});

// POST /api/users/me/wishlist
router.post('/me/wishlist', requireJwt('user'), async (req, res) => {
    try {
        const { tripId } = req.body;
        if (!tripId) return res.status(400).json({ message: 'tripId required' });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.wishlist) user.wishlist = [];
        if (!user.wishlist.some(id => id.toString() === tripId)) {
            user.wishlist.push(tripId);
            await user.save();
        }
        res.status(201).json(user.wishlist);
    } catch (err) {
        res.status(400).json({ message: 'Failed to add to wishlist', details: err.message });
    }
});

// DELETE /api/users/me/wishlist/:tripId
router.delete('/me/wishlist/:tripId', requireJwt('user'), async (req, res) => {
    try {
        const { tripId } = req.params;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { wishlist: tripId } },
            { new: true }
        ).select('wishlist');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove from wishlist', details: err.message });
    }
});

// PUT /api/users/me/profile
router.put('/me/profile', requireJwt('user'), async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update profile', details: err.message });
    }
});

export default router;
