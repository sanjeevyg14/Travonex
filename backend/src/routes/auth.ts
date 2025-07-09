import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import User from '../models/user';
import Organizer from '../models/organizer';
import AdminUser from '../models/adminUser';
import { validateOtp } from '../services/otp';

const router = express.Router();


// Signup endpoint
router.post('/signup', async (req, res, next) => {
  try {
    const { name, accountType, idToken } = req.body;
    if (!name || !accountType || !idToken) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email;
    const phone = decoded.phone_number;

    const existingUser =
      (await User.findOne({ firebaseUid })) ||
      (await Organizer.findOne({ firebaseUid }));

    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists' });
    }

    if (accountType === 'ORGANIZER') {
      const organizer = await Organizer.create({
        firebaseUid,
        name,
        email,
        phone,
      });
      const token = jwt.sign(
        { id: organizer.id, role: 'ORGANIZER' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      return res.status(201).json({
        token,
        user: { id: organizer.id, name: organizer.name, email: organizer.email, role: 'ORGANIZER' },
      });
    }

    const user = await User.create({ firebaseUid, name, email, phone });
    const token = jwt.sign(
      { id: user.id, role: 'USER' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'USER' } });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, credential } = req.body;
    if (!identifier || !credential) {
      return res.status(400).json({ message: 'Identifier and credential required' });
    }

    let user: any = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    let role = 'USER';
    if (!user) {
      const organizer = await Organizer.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
      if (organizer) {
        user = organizer;
        role = 'ORGANIZER';
      }
    }
    if (!user) {
      const adminUser = await AdminUser.findOne({ email: identifier });
      if (adminUser) {
        user = adminUser;
        role = 'ADMIN';
      }
    }
    if (!user) return res.status(404).json({ message: 'Account not found' });

    if (role === 'ADMIN') {
      if (credential !== 'password') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      const valid = await validateOtp(identifier, credential);
      if (!valid) return res.status(401).json({ message: 'Invalid OTP' });
    }

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (err) {
    next(err);
  }
});

// Logout simply responds success for now
router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export default router;
