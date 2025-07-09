import express, { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking';
import Payout from '../models/payout';
import User from '../models/user';
import Organizer from '../models/organizer';
import Trip from '../models/trip';
import Dispute from '../models/dispute';
import AdminRole from '../models/adminRole';
import Notification from '../models/notification';
import Banner from '../models/banner';
import AuditLog from '../models/auditLog';
import Category from '../models/category';
import Interest from '../models/interest';
import City from '../models/city';
import AdminUser from '../models/adminUser';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();
router.use(verifyJwt('ADMIN'));

async function logAction(
  req: Request,
  action: string,
  module: string,
  details: string
) {
  try {
    await AuditLog.create({
      adminId: (req as any).authUser.id,
      action,
      module,
      details,
    });
  } catch (err) {
    // Logging should not block the main operation
    console.error('Failed to record audit log', err);
  }
}
// Update authenticated admin profile
router.put('/me/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await AdminUser.findByIdAndUpdate((req as any).authUser.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', (_req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const bookings = await Booking.countDocuments();
    const payouts = await Payout.countDocuments();
    const users = await User.countDocuments();
    const organizers = await Organizer.countDocuments();
    res.json({ bookings, payouts, users, organizers });
  })().catch(next);
});

// ----- Roles CRUD -----
router.get('/roles', (_req, res, next) => {
  AdminRole.find()
    .then(r => res.json(r))
    .catch(next);
});

router.post('/roles', (req, res, next) => {
  AdminRole.create(req.body)
    .then(role => res.status(201).json(role))
    .catch(next);
});

router.put('/roles/:id', (req, res, next) => {
  AdminRole.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(role => {
      if (!role) return res.status(404).json({ message: 'Not found' });
      res.json(role);
    })
    .catch(next);
});

router.delete('/roles/:id', (req, res, next) => {
  AdminRole.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(next);
});

// ----- User management -----
router.get('/users', (_req, res, next) => {
  User.find()
    .then(u => res.json(u))
    .catch(next);
});

router.put('/users/:id', (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(async u => {
      if (!u) return res.status(404).json({ message: 'User not found' });
      await logAction(
        req,
        'Update',
        'User',
        `Updated user ${req.params.id}`
      );
      res.json(u);
    })
    .catch(next);
});

router.patch('/users/:id/wallet', (req, res, next) => {
  (async () => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const amount = Number(req.body.amount || 0);
    user.walletBalance += amount;
    user.walletTransactions.push({
      date: new Date(),
      description: 'Admin adjustment',
      amount,
      type: amount >= 0 ? 'Credit' : 'Debit',
      source: 'ADMIN',
    } as any);
    await user.save();
    res.json(user);
  })().catch(next);
});

// ----- Trips -----
router.get('/trips', (req, res, next) => {
  const query: any = {};
  if (req.query.status) query.status = req.query.status;
  Trip.find(query)
    .then(t => res.json(t))
    .catch(next);
});

router.patch('/trips/:id', (req, res, next) => {
  Trip.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(t => {
      if (!t) return res.status(404).json({ message: 'Trip not found' });
      res.json(t);
    })
    .catch(next);
});

// ----- Bookings -----
router.get('/bookings', (_req, res, next) => {
  Booking.find()
    .then(b => res.json(b))
    .catch(next);
});

router.get('/bookings/:id', (req, res, next) => {
  Booking.findById(req.params.id)
    .then(b => {
      if (!b) return res.status(404).json({ message: 'Booking not found' });
      res.json(b);
    })
    .catch(next);
});

// ----- Refund management -----
router.get('/refunds', (_req: Request, res: Response, next: NextFunction) => {
  Booking.find({ status: 'Cancelled' })
    .then(b => res.json(b))
    .catch(next);
});

router.post('/refunds/:id/process', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        refundStatus: 'Processed',
        refundPaymentMode: req.body.paymentMode,
        refundUtrNumber: req.body.utrNumber,
        refundPaidDate: req.body.paidDate ? new Date(req.body.paidDate) : new Date(),
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  })().catch(next);
});

// ----- Organizer management -----
router.get('/organizers', (_req, res, next) => {
  Organizer.find()
    .then(o => res.json(o))
    .catch(next);
});

router.get('/organizers/:id', (req, res, next) => {
  Organizer.findById(req.params.id)
    .then(o => {
      if (!o) return res.status(404).json({ message: 'Organizer not found' });
      res.json(o);
    })
    .catch(next);
});

router.patch('/organizers/:id/documents/:docId', (req, res, next) => {
  (async () => {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    const doc = (organizer.documents as any).id(req.params.docId);
  const doc = (organizer.documents as any).id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.status = req.body.status;
    doc.rejectionReason = req.body.rejectionReason;
    organizer.markModified('documents');
    await organizer.save();
    res.json(doc);
  })().catch(next);
});


router.patch('/organizers/:id/status', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const organizer = await Organizer.findByIdAndUpdate(req.params.id, { kycStatus: req.body.status }, { new: true });
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    await logAction(
      req,
      'Update',
      'Organizer',
      `Changed organizer ${req.params.id} status to ${req.body.status}`
    );
    res.json(organizer);
  })().catch(next);
});

router.get('/disputes', (_req: Request, res: Response, next: NextFunction) => {
  Dispute.find()
    .then(disputes => res.json(disputes))
    .catch(next);
});

router.patch('/disputes/:id', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json(dispute);
  })().catch(next);
});

router.post('/payouts/:id/process', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paidDate: new Date(), paymentMode: req.body.paymentMode },
      { new: true }
    );
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  })().catch(next);
});

// ----- Payout listing -----
router.get('/payouts', (_req, res, next) => {
  Payout.find()
    .then(p => res.json(p))
    .catch(next);
});

// ----- Revenue summary -----
router.get('/reports/summary', async (_req, res, next) => {
  try {
    const [result] = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ totalRevenue: result ? result.total : 0 });
  } catch (err) {
    next(err);
  }
});

// ----- Notifications -----
router.get('/notifications', (req, res, next) => {
  Notification.find({ userId: (req as any).authUser.id })
    .then(n => res.json(n))
    .catch(next);
});

router.post('/notifications/:id/read', (req, res, next) => {
  Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })
    .then(n => {
      if (!n) return res.status(404).json({ message: 'Notification not found' });
      try {
        const { getIO } = require('../socket');
        getIO().to(n.userId).emit('notification-read', n);
      } catch {}
      res.json(n);
    })
    .catch(next);
});

// ----- Banner management -----
router.get('/banners', (_req, res, next) => {
  Banner.find()
    .then(b => res.json(b))
    .catch(next);
});

router.post('/banners', (req, res, next) => {
  Banner.create(req.body)
    .then(b => res.status(201).json(b))
    .catch(next);
});

router.put('/banners/:id', (req, res, next) => {
  Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(b => {
      if (!b) return res.status(404).json({ message: 'Banner not found' });
      res.json(b);
    })
    .catch(next);
});

router.delete('/banners/:id', (req, res, next) => {
  Banner.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(next);
});

// ----- Audit logs -----
router.get('/audit-logs', (_req, res, next) => {
  AuditLog.find()
    .sort({ timestamp: -1 })
    .then(logs => res.json(logs))
    .catch(next);
});

// ----- Categories -----
router.get('/categories', (_req, res, next) => {
  Category.find()
    .then(c => res.json(c))
    .catch(next);
});

router.post('/categories', (req, res, next) => {
  Category.create(req.body)
    .then(c => res.status(201).json(c))
    .catch(next);
});

router.put('/categories/:id', (req, res, next) => {
  Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(c => {
      if (!c) return res.status(404).json({ message: 'Category not found' });
      res.json(c);
    })
    .catch(next);
});

router.delete('/categories/:id', (req, res, next) => {
  Category.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(next);
});

// ----- Interests -----
router.get('/interests', (_req, res, next) => {
  Interest.find()
    .then(i => res.json(i))
    .catch(next);
});

router.post('/interests', (req, res, next) => {
  Interest.create(req.body)
    .then(i => res.status(201).json(i))
    .catch(next);
});

router.put('/interests/:id', (req, res, next) => {
  Interest.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(i => {
      if (!i) return res.status(404).json({ message: 'Interest not found' });
      res.json(i);
    })
    .catch(next);
});

router.delete('/interests/:id', (req, res, next) => {
  Interest.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(next);
});

// ----- Cities -----
router.get('/cities', (_req, res, next) => {
  City.find()
    .then(c => res.json(c))
    .catch(next);
});

router.post('/cities', (req, res, next) => {
  City.create(req.body)
    .then(c => res.status(201).json(c))
    .catch(next);
});

router.put('/cities/:id', (req, res, next) => {
  City.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(c => {
      if (!c) return res.status(404).json({ message: 'City not found' });
      res.json(c);
    })
    .catch(next);
});

router.delete('/cities/:id', (req, res, next) => {
  City.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(next);
});

export default router;
