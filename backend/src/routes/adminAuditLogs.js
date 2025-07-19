import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { requireJwt } from '../middlewares/jwtAuth.js';
import { Parser } from 'json2csv';

const router = express.Router();

// GET /api/admin/audit-logs
router.get('/', requireJwt('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('admin').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/audit-logs/export
router.get('/export', requireJwt('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('admin').sort({ createdAt: -1 });
    const fields = ['createdAt', 'action', 'targetCollection', 'targetId'];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs.map(l => ({
      createdAt: l.createdAt,
      action: l.action,
      targetCollection: l.targetCollection,
      targetId: l.targetId
    })));
    res.header('Content-Type', 'text/csv');
    res.attachment('audit-logs.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
