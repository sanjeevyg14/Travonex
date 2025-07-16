import express from 'express';
import { firebaseAuth, firebaseDB } from '../utils/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

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

        await firebaseDB.collection('users').doc(uid).set({
            uid,
            phone: phone_number,
            role,
            name,
            email,
            createdAt: Timestamp.now(),
        }, { merge: true });

        return res.status(201).json({ uid });
    } catch (err) {
        return res.status(401).json({ message: 'OTP verification failed', details: err.message });
    }
});

export default router;
