import express from 'express';
import bcrypt from 'bcryptjs';
import Role from '../models/Role.js';
import AdminUser from '../models/AdminUser.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

// ----- Roles -----
router.get('/roles', requireJwt('admin'), async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
});

router.post('/roles', requireJwt('admin'), async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/roles/:id', requireJwt('admin'), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  res.json(role);
});

router.put('/roles/:id', requireJwt('admin'), async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/roles/:id', requireJwt('admin'), async (req, res) => {
  try {
    const inUse = await AdminUser.findOne({ role: req.params.id });
    if (inUse) return res.status(400).json({ message: 'Role assigned to users' });
    const deleted = await Role.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----- Admin Users -----
router.get('/users', requireJwt('admin'), async (req, res) => {
  const admins = await AdminUser.find().populate('role');
  res.json(admins);
});

router.post('/users', requireJwt('admin'), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const admin = new AdminUser({ ...rest, password: hashed });
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/users/:id', requireJwt('admin'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const admin = await AdminUser.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('role');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
