import express from 'express';
import AdminSetting from '../models/adminSetting';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ADMIN'));

router.put('/:section', async (req, res, next) => {
  try {
    const { section } = req.params;
    const settings = req.body;
    const doc = await AdminSetting.findOneAndUpdate(
      { section },
      { section, settings },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.get('/:section', async (req, res, next) => {
  try {
    const doc = await AdminSetting.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
