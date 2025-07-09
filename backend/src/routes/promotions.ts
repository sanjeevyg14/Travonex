import express from 'express';
import PromoCode from '../models/promoCode';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ADMIN'));

router.get('/', (_req, res, next) => {
  PromoCode.find()
    .then(p => res.json(p))
    .catch(next);
});

router.post('/', (req, res, next) => {
  PromoCode.create(req.body)
    .then(p => res.status(201).json(p))
    .catch(next);
});

router.put('/:id', (req, res, next) => {
  PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(p => {
      if (!p) return res.status(404).json({ message: 'Promo code not found' });
      res.json(p);
    })
    .catch(next);
});

router.patch('/:id/disable', (req, res, next) => {
  PromoCode.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true })
    .then(p => {
      if (!p) return res.status(404).json({ message: 'Promo code not found' });
      res.json(p);
    })
    .catch(next);
});

export default router;
