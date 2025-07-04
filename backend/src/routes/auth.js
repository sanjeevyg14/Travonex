const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

router.post('/vendor/signup', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    let user = await User.findOne({ phoneNumber, role: 'vendor' });
    if (user) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }
    user = await User.create({ phoneNumber, role: 'vendor' });
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid token' });
  }
});

router.post('/vendor/login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    let user = await User.findOne({ phoneNumber, role: 'vendor' });
    if (!user) {
      user = await User.create({ phoneNumber, role: 'vendor' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid token' });
  }
});

router.post('/admin/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email, role: 'admin' });
    if (user) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hashed, role: 'admin' });
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
