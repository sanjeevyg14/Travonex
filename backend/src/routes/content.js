import express from 'express';
import Content from '../models/Content.js';

const router = express.Router();

// GET /api/content/:slug
router.get('/:slug', async (req, res) => {
  try {
    const content = await Content.findOne({ slug: req.params.slug });
    if (!content) return res.status(404).json({ error: 'Not found' });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/content/:slug
router.put('/:slug', async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { slug: req.params.slug },
      { body: req.body.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
