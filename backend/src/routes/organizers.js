import express from 'express';
import Organizer from '../models/Organizer.js';

const router = express.Router();

// Get all organizers
router.get('/', async (req, res) => {
    try {
        const organizers = await Organizer.find();
        res.json(organizers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new organizer
router.post('/', async (req, res) => {
    try {
        const organizer = new Organizer(req.body);
        await organizer.save();
        res.status(201).json(organizer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
