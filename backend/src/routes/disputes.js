import express from 'express';
import Dispute from '../models/Dispute.js';
import { requireJwt } from '../middlewares/jwtAuth.js';

const router = express.Router();

// Create a dispute
router.post('/', requireJwt('user'), async (req, res) => {
  try {
    const dispute = await Dispute.create({
      user: req.user.id,
      booking: req.body.booking,
      description: req.body.description
    });
    res.status(201).json(dispute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
