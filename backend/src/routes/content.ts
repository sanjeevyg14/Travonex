import express from 'express';
import ContentPage from '../models/contentPage';
import Faq from '../models/faq';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();

// FAQ CRUD
router.get('/faqs', async (_req, res, next) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (err) {
    next(err);
  }
});

router.post('/faqs', verifyJwt('ADMIN'), async (req, res, next) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
});

router.put('/faqs/:id', verifyJwt('ADMIN'), async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'Not found' });
    res.json(faq);
  } catch (err) {
    next(err);
  }
});

router.delete('/faqs/:id', verifyJwt('ADMIN'), async (req, res, next) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Public get page content
router.get('/:slug', async (req, res, next) => {
  try {
    const page = await ContentPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// Update page content
router.put('/:slug', verifyJwt('ADMIN'), async (req, res, next) => {
  try {
    const page = await ContentPage.findOneAndUpdate(
      { slug: req.params.slug },
      { content: req.body.content },
      { new: true, upsert: true }
    );
    res.json(page);
  } catch (err) {
    next(err);
  }
});

export default router;
