// Middleware to protect routes (example: require Firebase Auth)
import { firebaseAuth } from '../utils/firebase.js';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const idToken = authHeader.split(' ')[1];
    try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        req.user = decoded;
        // Optionally, fetch user from DB and attach
        req.dbUser = await User.findOne({ phone: decoded.phone_number });
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
