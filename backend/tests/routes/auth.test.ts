import request from 'supertest';
import express from 'express';

jest.mock('../../src/models/user');
jest.mock('../../src/models/organizer');
jest.mock('../../src/models/adminUser');

import router from '../../src/routes/auth';
import * as otpService from '../../src/services/otp';

import User from '../../src/models/user';

const app = express();
app.use(express.json());
app.use(router);

describe('auth routes - otp flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends otp and stores it', async () => {
    const res = await request(app).post('/send-otp').send({ phone: '+10000000001' });
    expect(res.status).toBe(200);
    expect(otpService._getOtp('+10000000001')).toBeDefined();
  });

  it('resends otp with new code', async () => {
    await request(app).post('/send-otp').send({ phone: '+10000000002' });
    const first = otpService._getOtp('+10000000002');
    await request(app).post('/resend-otp').send({ phone: '+10000000002' });
    const second = otpService._getOtp('+10000000002');
    expect(first).not.toBe(second);
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
