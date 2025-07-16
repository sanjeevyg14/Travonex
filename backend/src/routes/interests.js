import express from 'express';
import Interest from '../models/Interest.js';

const router = express.Router();

// Get all interests
router.get('/', async (req, res) => {
    try {
        const interests = await Interest.find();
        res.json(interests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
