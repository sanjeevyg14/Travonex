import express from 'express';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';

const router = express.Router();

// POST /api/auth/signup
// Body: { name, email, phone, accountType }
router.post('/', async (req, res) => {
    const { name, email, phone, accountType } = req.body;
    if (!name || !email || !phone || !accountType) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Check for duplicates
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        const organizerExists = await Organizer.findOne({ $or: [{ email }, { phone }] });
        if (userExists || organizerExists) {
            return res.status(409).json({ message: 'An account with this email or phone already exists.' });
        }
        if (accountType === 'ORGANIZER') {
            const organizer = new Organizer({ name, email, phone, kycStatus: 'Incomplete', vendorAgreementStatus: 'Not Submitted' });
            await organizer.save();
        } else {
            const user = new User({ name, email, phone });
            await user.save();
        }
        res.status(201).json({ message: 'Account created successfully. Please login to continue.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', details: err.message });
    }
});

export default router;
