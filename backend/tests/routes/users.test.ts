import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (req: any, _res: any, next: any) => {
    req.authUser = { id: 'u1', role: 'USER' };
    next();
  }
}));

import router from '../../src/routes/users';
import User from '../../src/models/user';

jest.mock('../../src/models/user');

const app = express();
app.use(express.json());
app.use(router);

describe('users routes - wallet', () => {
  it('credits wallet balance and records transaction', async () => {
    const user: any = { walletBalance: 10, walletTransactions: [], save: jest.fn().mockResolvedValue(null) };
    (User.findById as jest.Mock).mockResolvedValue(user);

    const res = await request(app)
      .post('/me/wallet-transactions')
      .send({ amount: 15, description: 'topup' });

    expect(res.status).toBe(200);
    expect(user.walletBalance).toBe(25);
    expect(user.walletTransactions).toHaveLength(1);
    expect(user.save).toHaveBeenCalled();
  });

  it('rejects debit if insufficient balance', async () => {
    const user: any = { walletBalance: 5, walletTransactions: [], save: jest.fn() };
    (User.findById as jest.Mock).mockResolvedValue(user);

    const res = await request(app)
      .post('/me/wallet-transactions')
      .send({ amount: -10 });

    expect(res.status).toBe(400);
    expect(user.walletBalance).toBe(5);
  });
});
