import express from 'express';
import { firebaseAuth, firebaseDB } from '../utils/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import { generateReferralCode } from '../utils/referral.js';


const router = express.Router();

// POST /api/auth/otp-signup
// Body: { idToken, name, email, role }
router.post('/', async (req, res) => {
    const { idToken, name, email, role } = req.body;
    if (!idToken || !name || !email || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        const { uid, phone_number } = decoded;
        const phone = phone_number;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number not present in token' });
        }

        const existingUser = await User.findOne({ phone });
        const existingOrg = await Organizer.findOne({ phone });
        if (existingUser || existingOrg) {
            return res.status(409).json({ message: 'Account with this phone already exists.' });
        }

        await firebaseDB.collection('users').doc(uid).set({
            uid,
            phone,
    try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        const { uid, phone_number } = decoded;

        await firebaseDB.collection('users').doc(uid).set({
            uid,
            phone: phone_number,
            role,
            name,
            email,
            createdAt: Timestamp.now(),
        }, { merge: true });

        if (role === 'ORGANIZER') {
            const organizer = new Organizer({
                name,
                email,
                phone,
                kycStatus: 'Incomplete',
                vendorAgreementStatus: 'Not Submitted',
            });
            await organizer.save();
        } else {
            const user = new User({
                name,
                email,
                phone,
                referralCode: generateReferralCode(),
            });
            await user.save();
        }

        return res.status(201).json({ uid });
    } catch (err) {
        return res.status(401).json({ message: 'OTP verification failed', details: err.message });
    }
});

export default router;
