import express from 'express';
import City from '../models/city';
import Category from '../models/category';
import Interest from '../models/interest';

const router = express.Router();

router.get('/cities', (_req, res, next) => {
  City.find({ enabled: true })
    .then(c => res.json(c))
    .catch(next);
});

router.get('/categories', (_req, res, next) => {
  Category.find({ status: 'Active' })
    .then(c => res.json(c))
    .catch(next);
});

router.get('/interests', (_req, res, next) => {
  Interest.find({ status: 'Active' })
    .then(i => res.json(i))
    .catch(next);
});

export default router;
