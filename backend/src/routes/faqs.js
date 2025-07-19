import express from 'express';
import Faq from '../models/Faq.js';

const router = express.Router();

// GET /api/faqs
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faqs
router.post('/', async (req, res) => {
  try {
    const faq = await Faq.create({ question: req.body.question, answer: req.body.answer });
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faqs/:id
router.put('/:id', async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question: req.body.question, answer: req.body.answer },
      { new: true }
    );
    if (!faq) return res.status(404).json({ error: 'Not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/faqs/:id
router.delete('/:id', async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
