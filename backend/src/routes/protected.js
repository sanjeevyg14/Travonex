import express from 'express';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// Example protected route
router.get('/', requireAuth, (req, res) => {
    res.json({ message: 'You are authenticated!', user: req.user, dbUser: req.dbUser });
});

export default router;
