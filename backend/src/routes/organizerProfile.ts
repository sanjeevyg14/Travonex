import express from 'express';
import multer from 'multer';
import Organizer from '../models/organizer';
import { verifyJwt } from '../middleware/verifyJwt';
import { uploadFile } from '../services/upload';

const router = express.Router();
const upload = multer({ dest: 'tmp/' });
router.use(verifyJwt('ORGANIZER'));

router.put('/:id/profile', async (req, res, next) => {
  if (req.params.id !== (req as any).authUser.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const organizer = await Organizer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json(organizer);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/documents', upload.single('file'), async (req, res, next) => {
  if (req.params.id !== (req as any).authUser.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { docType, docTitle } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const fileUrl = await uploadFile(req.file);
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    const existing = organizer.documents.find(d => d.docType === docType);
    if (existing) {
      existing.fileUrl = fileUrl;
      existing.status = 'Uploaded';
      existing.uploadedAt = new Date();
    } else {
      organizer.documents.push({ docType, docTitle, fileUrl, uploadedAt: new Date(), status: 'Uploaded' } as any);
    }
    organizer.markModified('documents');
    await organizer.save();
    res.json(organizer.documents);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/agreement', async (req, res, next) => {
  if (req.params.id !== (req as any).authUser.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      { vendorAgreementStatus: 'Submitted' },
      { new: true }
    );
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json(organizer);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit-for-verification', async (req, res, next) => {
  if (req.params.id !== (req as any).authUser.id) return res.status(403).json({ message: 'Forbidden' });
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    const docsOk = organizer.documents.every(d => d.status === 'Uploaded' || d.status === 'Verified');
    if (organizer.vendorAgreementStatus !== 'Submitted' || !docsOk) {
      return res.status(400).json({ message: 'KYC incomplete' });
    }
    organizer.kycStatus = 'Pending';
    await organizer.save();
    res.json(organizer);
  } catch (err) {
    next(err);
  }
});

export default router;
