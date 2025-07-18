import express from 'express';
import Dispute from '../models/Dispute.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

// List disputes
router.get('/', requireJwt('admin'), async (req, res) => {
  const disputes = await Dispute.find().populate('user booking');
  res.json(disputes);
});

// Update dispute status
router.patch('/:id', requireJwt('admin'), async (req, res) => {
  const dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
  res.json(dispute);
});

export default router;
