import request from 'supertest';
import express from 'express';

jest.mock('../../src/models/user');
jest.mock('../../src/models/organizer');
jest.mock('../../src/models/adminUser');
jest.mock('firebase-admin', () => {
  const verify = jest.fn();
  return { __esModule: true, default: { auth: () => ({ verifyIdToken: verify }) } };
});

import router from '../../src/routes/auth';
import * as otpService from '../../src/services/otp';
import admin from 'firebase-admin';

import User from '../../src/models/user';

const app = express();
app.use(express.json());
app.use(router);

const firebaseApp = express();
firebaseApp.use(express.json());
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = header.split(' ')[1];
  admin
    .auth()
    .verifyIdToken(token)
    .then(decoded => {
      (req as any).user = decoded;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid token' });
    });
}
firebaseApp.get('/protected', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

describe('auth routes - otp flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('allows login with valid otp', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Test', email: 't@test.com' });
    await request(app).post('/send-otp').send({ phone: '+10000000003' });
    const code = otpService._getOtp('+10000000003')!;
    const res = await request(app)
      .post('/login')
      .send({ identifier: '+10000000003', credential: code });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with invalid otp', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Test', email: 't@test.com' });
    await request(app).post('/send-otp').send({ phone: '+10000000004' });
    const res = await request(app)
      .post('/login')
      .send({ identifier: '+10000000004', credential: '000000' });
    expect(res.status).toBe(401);
  });
});

describe('firebase token auth', () => {
  const verify = admin.auth().verifyIdToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('grants access with valid token', async () => {
    verify.mockResolvedValue({ uid: 'user1' });
    const res = await request(firebaseApp)
      .get('/protected')
      .set('Authorization', 'Bearer valid');
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ uid: 'user1' });
  });

  it('rejects invalid token', async () => {
    verify.mockRejectedValue(new Error('invalid'));
    const res = await request(firebaseApp)
      .get('/protected')
      .set('Authorization', 'Bearer bad');
    expect(res.status).toBe(401);
  });
});
