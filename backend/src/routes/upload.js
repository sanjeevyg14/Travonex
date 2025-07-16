import express from 'express';
import multer from 'multer';
import { firebaseStorage } from '../utils/firebase.js';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
// FormData: file
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const bucket = getStorage().bucket();
        const fileName = `${uuidv4()}-${req.file.originalname}`;
        const file = bucket.file(fileName);
        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            public: true,
            metadata: { firebaseStorageDownloadTokens: uuidv4() },
        });
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        res.json({ url: publicUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
