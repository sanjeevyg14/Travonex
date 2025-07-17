import express from 'express';
import User from '../models/User.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

// Get all users
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

// GET /api/users/me/profile
router.get('/me/profile', requireJwt('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', details: err.message });
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
