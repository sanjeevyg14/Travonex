import express from 'express';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import AdminUser from '../models/AdminUser.js';
import { firebaseAuth } from '../utils/firebase.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login
// Body: { identifier, credential }
router.post('/', async (req, res) => {
    const { identifier, credential } = req.body;
    if (!identifier || !credential) {
        return res.status(400).json({ message: 'Identifier and credential are required' });
    }
    try {
        let user = null;
        let role = null;
        let redirectPath = '/';
        // Admin login (email + password)
        if (identifier.includes('@')) {
            const admin = await AdminUser.findOne({ email: identifier });
            if (!admin) return res.status(401).json({ message: 'Admin account not found.' });
            if (admin.status !== 'Active') return res.status(403).json({ message: `Admin account is ${admin.status}.` });
            if (!(await admin.comparePassword(credential))) return res.status(401).json({ message: 'Invalid password.' });
            user = admin;
            role = 'admin';
            redirectPath = '/admin/dashboard';
        } else {
            // User/Organizer login (phone + OTP)
            // credential is Firebase ID token
            const decoded = await firebaseAuth.verifyIdToken(credential);
            const phone = decoded.phone_number;
            let organizer = await Organizer.findOne({ phone });
            if (organizer) {
                user = organizer;
                role = 'organizer';
                redirectPath = organizer.kycStatus === 'Verified' ? '/trip-organiser/dashboard' : '/trip-organiser/profile';
            } else {
                let regularUser = await User.findOne({ phone });
                if (regularUser) {
                    user = regularUser;
                    role = 'user';
                    redirectPath = '/';
                }
            }
            if (!user) return res.status(404).json({ message: 'User or Organizer account not found.' });
        }
        // Issue JWT
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { id: user._id, name: user.name, email: user.email, role }, token, redirectPath });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', details: err.message });
    }
});

export default router;
