import express from 'express';
import City from '../models/City.js';

const router = express.Router();

// Get all cities
router.get('/', async (req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
