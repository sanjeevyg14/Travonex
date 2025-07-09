import request from 'supertest';
import express from 'express';

const verifyMock = jest.fn();
jest.mock('firebase-admin', () => ({
  auth: () => ({ verifyIdToken: verifyMock }),
  default: { auth: () => ({ verifyIdToken: verifyMock }) }

jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'fb1',
      email: 'test@example.com',
      phone_number: '+10000000001',
    })
  })
}));

jest.mock('../../src/models/user');
jest.mock('../../src/models/organizer');

import router from '../../src/routes/auth';
import User from '../../src/models/user';
import Organizer from '../../src/models/organizer';

const app = express();
app.use(express.json());
app.use(router);

describe('auth routes - firebase login', () => {
describe('auth routes - signup with firebase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates user with firebase uid', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (Organizer.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@example.com' });

  it('resends otp with new code', async () => {
    await request(app).post('/send-otp').send({ phone: '+10000000002' });
    const first = otpService._getOtp('+10000000002');
    await request(app).post('/resend-otp').send({ phone: '+10000000002' });
    const second = otpService._getOtp('+10000000002');
    expect(first).not.toBe(second);
  });

  it('allows login with valid idToken', async () => {
    verifyMock.mockResolvedValue({ uid: 'f1', email: 't@test.com' });
    (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Test', email: 't@test.com' });

    const res = await request(app).post('/login').send({ idToken: 'good' });

    expect(res.status).toBe(200);
    expect(verifyMock).toHaveBeenCalledWith('good');
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with invalid idToken', async () => {
    verifyMock.mockRejectedValue(new Error('bad'));

    const res = await request(app).post('/login').send({ idToken: 'bad' });

    expect(res.status).toBe(401);

    const res = await request(app)
      .post('/signup')
      .send({ name: 'Test', accountType: 'USER', idToken: 'token' });

    expect(res.status).toBe(201);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ firebaseUid: 'fb1' })
    );
  });
});
