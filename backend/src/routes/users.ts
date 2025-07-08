import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt());

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const user = await User.findById((req as any).authUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  })().catch(next);
});

export default router;
