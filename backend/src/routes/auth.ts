import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Organizer from '../models/organizer';
import AdminUser from '../models/adminUser';

const router = express.Router();

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
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Identifier required' });
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
