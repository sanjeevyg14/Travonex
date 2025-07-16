import express from 'express';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import { firebaseAuth } from '../utils/firebase.js';
import { generateReferralCode } from '../utils/referral.js';

const router = express.Router();

// POST /api/auth/signup
// Body: { name, email, password, accountType, referralCode, terms }
router.post('/', async (req, res) => {
    const { name, email, password, accountType, referralCode, terms } = req.body;
    if (!name || !email || !password || !accountType || terms !== true) {
// Body: { name, email, idToken, accountType, referralCode, terms }
// `idToken` must come from Firebase Phone Auth (verifying the OTP)
router.post('/', async (req, res) => {
    const { name, email, idToken, accountType, referralCode, terms } = req.body;
    if (!name || !email || !idToken || !accountType || terms !== true) {
        return res.status(400).json({ message: 'Missing required fields or terms not accepted' });
    }
    try {
        // Verify Firebase ID token and extract phone number
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        const phone = decoded.phone_number;
        if (!phone) {
            return res.status(400).json({ message: 'Invalid phone verification token' });
        }
        // Check for duplicates
        const userExists = await User.findOne({ email });
        const organizerExists = await Organizer.findOne({ email });
        if (userExists || organizerExists) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        let referredBy = null;
        if (referralCode) {
            const refUser = await User.findOne({ referralCode });
            if (refUser) referredBy = refUser._id;
        }

        if (accountType === 'ORGANIZER') {
            const organizer = new Organizer({
                name,
                email,
                password,
                phone,
                kycStatus: 'Incomplete',
                vendorAgreementStatus: 'Not Submitted',
            });
            await organizer.save();
        } else {
            const user = new User({
                name,
                email,
                password,
                phone,
                referralCode: generateReferralCode(),
                referredBy,
            });
            await user.save();
        }
        res.status(201).json({ message: 'Account created successfully. Please login to continue.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', details: err.message });
    }
});

export default router;
