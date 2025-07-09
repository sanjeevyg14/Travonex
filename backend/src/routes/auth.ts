import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import User from '../models/user';
import Organizer from '../models/organizer';
import AdminUser from '../models/adminUser';
import { sendOtp, resendOtp } from '../services/otp';

const router = express.Router();

// Send OTP
router.post('/send-otp', async (req, res) => {
  const phone = req.body.phone;
  if (!phone) return res.status(400).json({ message: 'Phone required' });
  const code = await sendOtp(phone);
  const resp: any = { success: true };
  if (process.env.NODE_ENV === 'test') resp.otp = code;
  res.json(resp);
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const phone = req.body.phone;
  if (!phone) return res.status(400).json({ message: 'Phone required' });
  const code = await resendOtp(phone);
  const resp: any = { success: true };
  if (process.env.NODE_ENV === 'test') resp.otp = code;
  res.json(resp);
});

// Signup endpoint
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, phone, accountType } = req.body;
    if (!name || !email || !phone || !accountType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser =
      (await User.findOne({ $or: [{ email }, { phone }] })) ||
      (await Organizer.findOne({ $or: [{ email }, { phone }] }));
    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists' });
    }
    if (accountType === 'ORGANIZER') {
      const organizer = await Organizer.create({ name, email, phone });
      const token = jwt.sign({ id: organizer.id, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: organizer.id, name: organizer.name, email: organizer.email, role: 'ORGANIZER' } });
    }
    const user = await User.create({ name, email, phone });
    const token = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'USER' } });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, credential, idToken } = req.body;

    // Admin login continues to use identifier + credential
    if (identifier && credential) {
      const adminUser = await AdminUser.findOne({ email: identifier });
      if (!adminUser) return res.status(404).json({ message: 'Account not found' });
      if (credential !== 'password') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ token, user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'ADMIN' } });
    }

    if (!idToken) {
      return res.status(400).json({ message: 'idToken required' });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const orConditions: any[] = [{ firebaseUid: decoded.uid }];
    if (decoded.email) orConditions.push({ email: decoded.email });
    if (decoded.phone_number) orConditions.push({ phone: decoded.phone_number });

    let user: any = await User.findOne({ $or: orConditions });
    let role = 'USER';
    if (!user) {
      const organizer = await Organizer.findOne({ $or: orConditions });
      if (organizer) {
        user = organizer;
        role = 'ORGANIZER';
      }
    }

    if (!user) return res.status(404).json({ message: 'Account not found' });

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
