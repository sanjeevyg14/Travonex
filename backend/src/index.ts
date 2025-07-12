import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import Razorpay from 'razorpay';
import http from 'http';
import env from './config';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import bookingRoutes from './routes/bookings';
import couponRoutes from './routes/coupons';
import organizerRoutes from './routes/organizers';
import organizerProfileRoutes from './routes/organizerProfile';
import adminRoutes from './routes/admin';
import promotionsRoutes from './routes/promotions';
import adminSettingsRoutes from './routes/adminSettings';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import referenceRoutes from './routes/reference';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';

declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
      authUser?: { id: string; role: string };
    }
  }
}

const app = express();
const PORT = Number(env.PORT);
const server = http.createServer(app);
initSocket(server);

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/organizers/me', organizerRoutes);
app.use('/api/organizers', organizerProfileRoutes);
app.use('/api/admin/promotions', promotionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reference', referenceRoutes);


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });
}

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

mongoose
  .connect(env.MONGODB_URI)
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

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
