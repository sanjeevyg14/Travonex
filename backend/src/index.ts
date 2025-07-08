import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import Razorpay from 'razorpay';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

mongoose
  .connect(process.env.MONGODB_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = header.split(' ')[1];
  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      req.user = decoded;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid token' });
    });
}

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
