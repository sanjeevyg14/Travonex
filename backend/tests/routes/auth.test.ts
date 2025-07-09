import request from 'supertest';
import express from 'express';

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

describe('auth routes - signup with firebase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates user with firebase uid', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (Organizer.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@example.com' });

    const res = await request(app)
      .post('/signup')
      .send({ name: 'Test', accountType: 'USER', idToken: 'token' });

    expect(res.status).toBe(201);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ firebaseUid: 'fb1' })
    );
  });
});
