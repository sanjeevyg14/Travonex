import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Organizer from '../models/organizer';

const router = express.Router();

router.post('/login', (req, res, next) => {
  (async () => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email || '';
    const phone = decoded.phone_number || '';

    let user = await User.findOne({ $or: [{ email }, { phone }] });
    let role: string = 'USER';

    if (!user) {
      const organizer = await Organizer.findOne({ $or: [{ email }, { phone }] });
      if (organizer) {
        role = 'ORGANIZER';
        user = organizer as any;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const jwtPayload = { id: user.id, role };
    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });
    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role } });
  })().catch(next);
});

export default router;
