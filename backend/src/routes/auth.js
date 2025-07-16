import express from 'express';
import { firebaseAuth } from '../utils/firebase.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/verify-phone
// Body: { idToken }
// Verifies Firebase phone auth token, creates user if not exists, returns user info
router.post('/verify-phone', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });
    try {
        // Verify Firebase ID token
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        const { uid, phone_number } = decoded;
        if (!phone_number) return res.status(400).json({ error: 'No phone number in token' });

        // Find or create user
        let user = await User.findOne({ phone: phone_number });
        if (!user) {
            user = new User({ phone: phone_number, role: 'user' });
            await user.save();
        }
        res.json({ user });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token', details: err.message });
    }
});

export default router;
