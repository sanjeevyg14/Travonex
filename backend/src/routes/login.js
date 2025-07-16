import express from 'express';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import AdminUser from '../models/AdminUser.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login
// Body: { email, password }
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        let user = null;
        let role = null;
        let redirectPath = '/';
        // Admin login
        const admin = await AdminUser.findOne({ email });
        if (admin) {
            if (admin.status !== 'Active') return res.status(403).json({ message: `Admin account is ${admin.status}.` });
            if (!(await admin.comparePassword(password))) return res.status(401).json({ message: 'Invalid password.' });
            user = admin;
            role = 'admin';
            redirectPath = '/admin/dashboard';
        } else {
            // Organizer login
            const organizer = await Organizer.findOne({ email });
            if (organizer && await organizer.comparePassword(password)) {
                user = organizer;
                role = 'organizer';
                redirectPath = organizer.kycStatus === 'Verified' ? '/trip-organiser/dashboard' : '/trip-organiser/profile';
            } else {
                const regularUser = await User.findOne({ email });
                if (regularUser && await regularUser.comparePassword(password)) {
                    user = regularUser;
                    role = 'user';
                    redirectPath = '/';
                }
            }
            if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // Issue JWT
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { id: user._id, name: user.name, email: user.email, role }, token, redirectPath });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', details: err.message });
    }
});

export default router;
